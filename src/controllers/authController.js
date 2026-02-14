import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';

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

    const passwordHash = await bcrypt.hash(password, 10);
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

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = generateToken(user.id);
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};
