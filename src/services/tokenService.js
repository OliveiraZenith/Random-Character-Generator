import crypto from 'crypto';

const DEFAULT_EXP_MINUTES = 30;

export const generatePasswordResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const minutes = parseInt(process.env.PASSWORD_RESET_EXPIRES_MINUTES || `${DEFAULT_EXP_MINUTES}`, 10);
  const expiresAt = new Date(Date.now() + (Number.isNaN(minutes) ? DEFAULT_EXP_MINUTES : minutes) * 60 * 1000);
  return { token, tokenHash, expiresAt };
};

export const hashToken = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

export const buildResetLink = (token) => {
  const base = process.env.PASSWORD_RESET_URL || `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173/register'}`;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}token=${encodeURIComponent(token)}`;
};

export default {
  generatePasswordResetToken,
  hashToken,
  buildResetLink
};
