import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '3m' });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '6m' });
};
