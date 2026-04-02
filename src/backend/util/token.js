import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './env.js';

/**
 * Generate a JWT for a user
 * @param {{ _id: string }} user
 * @returns {string}
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user._id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

