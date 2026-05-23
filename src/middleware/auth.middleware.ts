import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import type { JwtPayload, UserRole } from '../types/index.js';

const isJwtPayload = (payload: unknown): payload is JwtPayload => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const candidate = payload as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    (candidate.role === 'contributor' || candidate.role === 'maintainer')
  );
};

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authorization = req.header('Authorization');

  if (!authorization || authorization.trim().length === 0) {
    throw new AppError('Authorization token is required', StatusCodes.UNAUTHORIZED);
  }

  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : authorization;

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (!isJwtPayload(decoded)) {
      throw new AppError('Invalid token payload', StatusCodes.UNAUTHORIZED);
    }
    req.user = decoded;
    next();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED);
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', StatusCodes.FORBIDDEN);
    }

    next();
  };
};
