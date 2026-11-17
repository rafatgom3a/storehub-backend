import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'Authentication is not configured.' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email role');
    if (!user) return res.status(401).json({ message: 'This account no longer exists.' });
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'CastError') {
      return res.status(401).json({ message: 'Your session is invalid or has expired. Please sign in again.' });
    }
    return next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access required.' });
  return next();
}
