import dotenv from 'dotenv';
import { AppError } from '../utils/appError.js';

dotenv.config();
const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new AppError(`Missing required environment variable: ${key}`, 500);
  }
  return value;
};

//
const parseSaltRounds = (value: string | undefined): number => {
  const parsed = Number(value ?? '10');
  if (!Number.isInteger(parsed) || parsed < 8 || parsed > 12) {
    throw new AppError('BCRYPT_SALT_ROUNDS must be an integer between 8 and 12', 500);
  }
  return parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  bcryptSaltRounds: parseSaltRounds(process.env.BCRYPT_SALT_ROUNDS),
  corsOrigin: process.env.CORS_ORIGIN ?? '*'
};
