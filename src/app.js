import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import { connectDatabase } from './config/database.js';

const app = express();

// Trust Vercel's reverse proxy
app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(origin => origin.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }));

// Vercel serverless functions may import app.js without running server.js.
// Ensure MongoDB is connected before every API handler (including health).
app.use('/api', async (_req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('[MongoDB connection failed]', error);
    res.status(503).json({
      message: 'Database unavailable. Check the backend MongoDB connection.',
      code: 'DATABASE_UNAVAILABLE',
    });
  }
});

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'StoreHub API',
  database: 'connected',
}));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.code === 11000) return res.status(409).json({ message: 'A record with this value already exists', fields: error.keyValue });
  if (error?.name === 'ValidationError' || error?.name === 'CastError') return res.status(400).json({ message: error.message });
  res.status(500).json({ message: 'Internal server error' });
});
export default app;
