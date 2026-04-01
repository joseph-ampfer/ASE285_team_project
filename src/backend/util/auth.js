import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Express middleware to require authentication
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = {
      id: user._id.toString(),
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

