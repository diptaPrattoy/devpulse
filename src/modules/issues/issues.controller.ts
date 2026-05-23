import { StatusCodes } from 'http-status-codes';
import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { AppError } from '../../utils/appError.js';
import {
  ensureNonEmptyString,
  ensureOptionalString,
  isValidIssueStatus,
  isValidIssueType,
  parseIdParam
} from '../../utils/validators.js';
import { createIssue, deleteIssue, getAllIssues, getIssueById, updateIssue } from './issues.service.js';
import type { CreateIssueBody, IssueSort, IssueStatus, IssueType, UpdateIssueBody } from '../../types/index.js';

interface IssuesQuery {
  sort?: string;
  type?: string;
  status?: string;
}

export const create = async (req: Request<unknown, unknown, CreateIssueBody>, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED);
  }

  const title = ensureNonEmptyString(req.body.title, 'title');
  const description = ensureNonEmptyString(req.body.description, 'description');
  const type = ensureNonEmptyString(req.body.type, 'type');

  if (title.length > 150) {
    throw new AppError('Title must not exceed 150 characters', StatusCodes.BAD_REQUEST);
  }

  if (description.length < 20) {
    throw new AppError('Description must be at least 20 characters long', StatusCodes.BAD_REQUEST);
  }

  if (!isValidIssueType(type)) {
    throw new AppError('Type must be bug or feature_request', StatusCodes.BAD_REQUEST);
  }

  const issue = await createIssue({
    title,
    description,
    type,
    reporter_id: req.user.id
  });

  sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
};

export const list = async (req: Request<unknown, unknown, unknown, IssuesQuery>, res: Response): Promise<void> => {
  const sortParam = req.query.sort ?? 'newest';
  if (sortParam !== 'newest' && sortParam !== 'oldest') {
    throw new AppError('sort must be newest or oldest', StatusCodes.BAD_REQUEST);
  }

  let type: IssueType | undefined;
  if (req.query.type !== undefined) {
    if (!isValidIssueType(req.query.type)) {
      throw new AppError('type must be bug or feature_request', StatusCodes.BAD_REQUEST);
    }
    type = req.query.type;
  }

  let status: IssueStatus | undefined;
  if (req.query.status !== undefined) {
    if (!isValidIssueStatus(req.query.status)) {
      throw new AppError('status must be open, in_progress, or resolved', StatusCodes.BAD_REQUEST);
    }
    status = req.query.status;
  }

  const issues = await getAllIssues({ sort: sortParam as IssueSort, type, status });
  sendSuccess(res, StatusCodes.OK, 'Issues retrived successfully', issues);
};

export const retrieve = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const id = parseIdParam(req.params.id);
  const issue = await getIssueById(id);
  sendSuccess(res, StatusCodes.OK, 'Issue retrived successfully', issue);
};

export const update = async (req: Request<{ id: string }, unknown, UpdateIssueBody>, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('Authentication required', StatusCodes.UNAUTHORIZED);
  }

  const id = parseIdParam(req.params.id);
  const title = ensureOptionalString(req.body.title, 'title');
  const description = ensureOptionalString(req.body.description, 'description');
  const rawType = ensureOptionalString(req.body.type, 'type');
  const rawStatus = ensureOptionalString(req.body.status, 'status');

  if (title !== undefined && title.length > 150) {
    throw new AppError('Title must not exceed 150 characters', StatusCodes.BAD_REQUEST);
  }

  if (description !== undefined && description.length < 20) {
    throw new AppError('Description must be at least 20 characters long', StatusCodes.BAD_REQUEST);
  }

  let type: IssueType | undefined;
  if (rawType !== undefined) {
    if (!isValidIssueType(rawType)) {
      throw new AppError('Type must be bug or feature_request', StatusCodes.BAD_REQUEST);
    }
    type = rawType;
  }

  let status: IssueStatus | undefined;
  if (rawStatus !== undefined) {
    if (!isValidIssueStatus(rawStatus)) {
      throw new AppError('Status must be open, in_progress, or resolved', StatusCodes.BAD_REQUEST);
    }
    status = rawStatus;
  }

  if (title === undefined && description === undefined && type === undefined && status === undefined) {
    throw new AppError('At least one field must be provided for update', StatusCodes.BAD_REQUEST);
  }

  const issue = await updateIssue(id, { title, description, type, status }, req.user);
  sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', issue);
};

export const remove = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const id = parseIdParam(req.params.id);
  await deleteIssue(id);
  sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
};
