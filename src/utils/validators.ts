import { StatusCodes } from 'http-status-codes';
import { AppError } from './appError.js';
import type { IssueStatus, IssueType, UserRole } from '../types/index.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => emailRegex.test(email.trim().toLowerCase());

export const isValidRole = (role: string): role is UserRole => role === 'contributor' || role === 'maintainer';

export const isValidIssueType = (type: string): type is IssueType => type === 'bug' || type === 'feature_request';

export const isValidIssueStatus = (status: string): status is IssueStatus =>
  status === 'open' || status === 'in_progress' || status === 'resolved';

export const ensureNonEmptyString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required`, StatusCodes.BAD_REQUEST);
  }
  return value.trim();
};

export const ensureOptionalString = (value: unknown, fieldName: string): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${fieldName} must be a non-empty string`, StatusCodes.BAD_REQUEST);
  }

  return value.trim();
};

export const parseIdParam = (value: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id parameter', StatusCodes.BAD_REQUEST);
  }
  return id;
};
