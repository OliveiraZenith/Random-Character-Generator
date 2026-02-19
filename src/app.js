import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';
import prisma from './prisma/client.js';
import authRoutes from './routes/authRoutes.js';
import worldRoutes from './routes/worldRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import annotationRoutes from './routes/annotationRoutes.js';
import tagRoutes from './routes/tagRoutes.js';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(compression());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/worlds', worldRoutes);
app.use('/', characterRoutes);
app.use('/', annotationRoutes);
app.use('/', tagRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  // Centralized error fallback
  return res.status(500).json({ message: 'Internal server error', error: err.message });
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`API running on port ${port}`);
});

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default app;
