import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (id: string): string => {
  const secret: Secret = process.env.SECRET || 'default_secret';
  return jwt.sign({ id}, secret, { expiresIn: '30d' });
};
