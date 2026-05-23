import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';
import { ensureNonEmptyString, isValidEmail, isValidRole } from '../../utils/validators.js';
import { loginUser, signupUser } from './auth.service.js';
import type { LoginBody, SignupBody, UserRole } from '../../types/index.js';

export const signup = async (req: Request<unknown, unknown, SignupBody>, res: Response): Promise<void> => {
  const name = ensureNonEmptyString(req.body.name, 'name');
  const email = ensureNonEmptyString(req.body.email, 'email').toLowerCase();
  const password = ensureNonEmptyString(req.body.password, 'password');
  const role: UserRole = req.body.role ?? 'contributor';

  if (!isValidEmail(email)) {
    throw new AppError('Invalid email address', StatusCodes.BAD_REQUEST);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', StatusCodes.BAD_REQUEST);
  }

  if (!isValidRole(role)) {
    throw new AppError('Role must be contributor or maintainer', StatusCodes.BAD_REQUEST);
  }

  const user = await signupUser({ name, email, password, role });
  sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', user);
};

export const login = async (req: Request<unknown, unknown, LoginBody>, res: Response): Promise<void> => {
  const email = ensureNonEmptyString(req.body.email, 'email').toLowerCase();
  const password = ensureNonEmptyString(req.body.password, 'password');

  if (!isValidEmail(email)) {
    throw new AppError('Invalid email address', StatusCodes.BAD_REQUEST);
  }

  const loginData = await loginUser(email, password);
  sendSuccess(res, StatusCodes.OK, 'Login successful', loginData);
};
