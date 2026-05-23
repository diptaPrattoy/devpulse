import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { pool } from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/appError.js';
import type { JwtPayload, SafeUser, User, UserRole } from '../../types/index.js';

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginResult {
  token: string;
  user: SafeUser;
}

const userSelectColumns = 'id, name, email, role, created_at, updated_at';

export const removePassword = (user: User): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at,
  updated_at: user.updated_at
});

export const signupUser = async (input: SignupInput): Promise<SafeUser> => {
  const existingUser = await pool.query<Pick<User, 'id'>>('SELECT id FROM users WHERE email = $1', [input.email]);

  if (existingUser.rowCount && existingUser.rowCount > 0) {
    throw new AppError('Email already exists', StatusCodes.BAD_REQUEST);
  }

  const hashedPassword = await bcrypt.hash(input.password, env.bcryptSaltRounds);

  const result = await pool.query<SafeUser>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${userSelectColumns}`,
    [input.name, input.email, hashedPassword, input.role]
  );

  const user = result.rows[0];
  if (!user) {
    throw new AppError('User registration failed', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return user;
};

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  const safeUser = removePassword(user);
  const tokenPayload: JwtPayload = {
    id: safeUser.id,
    name: safeUser.name,
    role: safeUser.role
  };

  const signOptions: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  const token = jwt.sign(tokenPayload, env.jwtSecret, signOptions);

  return {
    token,
    user: safeUser
  };
};
