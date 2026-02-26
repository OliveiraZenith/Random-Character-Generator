import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';
import { hashPassword, comparePassword } from '../services/passwordService.js';
import { generatePasswordResetToken, hashToken, buildResetLink } from '../services/tokenService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

const resolveJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const generateToken = (userId) => {
  const secret = resolveJwtSecret();
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    resolveJwtSecret(); // fail fast before side effects

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    const token = generateToken(user.id);
    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    resolveJwtSecret();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user.id);
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }

  const genericResponse = { message: 'Se existir conta, o e-mail foi enviado.' };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email não cadastrado.' });
    }

    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    const { token, tokenHash, expiresAt } = generatePasswordResetToken();
    await prisma.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt } });

    const link = buildResetLink(token);
    try {
      await sendPasswordResetEmail(user.email, link, user.name);
    } catch (mailError) {
      console.error('Failed to send reset email', mailError);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    return res.status(500).json({ message: 'Falha ao solicitar recuperação.', error: error.message });
  }
};

export const validateResetToken = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Token é obrigatório.' });
  }

  try {
    const tokenHash = hashToken(token);
    const reset = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!reset || !reset.user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    return res.status(200).json({
      valid: true,
      user: { id: reset.user.id, name: reset.user.name, email: reset.user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Falha ao validar token.', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token e nova senha são obrigatórios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'A nova senha deve ter ao menos 6 caracteres.' });
  }

  try {
    const tokenHash = hashToken(token);
    const reset = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!reset || !reset.user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.passwordReset.deleteMany({ where: { userId: reset.userId, id: { not: reset.id } } })
    ]);

    const authToken = generateToken(reset.userId);

    return res.status(200).json({
      message: 'Senha atualizada com sucesso.',
      token: authToken,
      user: { id: reset.user.id, name: reset.user.name, email: reset.user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Falha ao redefinir senha.', error: error.message });
  }
};
