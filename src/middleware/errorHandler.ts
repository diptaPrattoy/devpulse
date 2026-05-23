import { StatusCodes } from 'http-status-codes';
import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/appError.js';
import { sendError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

interface PgError extends Error {
  code?: string;
  detail?: string;
}

const isPgError = (error: unknown): error is PgError => error instanceof Error && 'code' in error;

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next): void => {
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.message, error.errors);
    return;
  }

  if (isPgError(error) && error.code === '23505') {
    sendError(res, StatusCodes.BAD_REQUEST, 'Duplicate resource', error.detail ?? 'A record with this value already exists');
    return;
  }

  const details = env.nodeEnv === 'production' ? undefined : error instanceof Error ? error.message : 'Unknown error';
  sendError(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal Server Error', details);
};
