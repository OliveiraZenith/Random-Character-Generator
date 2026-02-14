import jwt from 'jsonwebtoken';

const resolveJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured.');
  }
  return secret;
};

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, resolveJwtSecret());
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    const status = error.message.includes('configured') ? 500 : 401;
    return res.status(status).json({ message: 'Invalid or expired token.', error: error.message });
  }
};

export default authMiddleware;
