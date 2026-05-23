import type { Response } from 'express';

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string | string[];
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response<SuccessResponse<T>> => {
  const payload: SuccessResponse<T> = data === undefined ? { success: true, message } : { success: true, message, data };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: string | string[]
): Response<ErrorResponse> => {
  const payload: ErrorResponse = errors === undefined ? { success: false, message } : { success: false, message, errors };
  return res.status(statusCode).json(payload);
};
