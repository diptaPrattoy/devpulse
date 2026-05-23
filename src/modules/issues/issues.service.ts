import { StatusCodes } from 'http-status-codes';
import { pool } from '../../config/db.js';
import { AppError } from '../../utils/appError.js';
import type {
  Issue,
  IssueSort,
  IssueStatus,
  IssueType,
  IssueWithReporter,
  Reporter,
  UpdateIssueBody,
  UserRole
} from '../../types/index.js';

interface CreateIssueInput {
  title: string;
  description: string;
  type: IssueType;
  reporter_id: number;
}

interface IssueFilters {
  sort: IssueSort;
  type?: IssueType;
  status?: IssueStatus;
}

interface Requester {
  id: number;
  role: UserRole;
}

const issueColumns = 'id, title, description, type, status, reporter_id, created_at, updated_at';

const attachReporters = async (issues: Issue[]): Promise<IssueWithReporter[]> => {
  if (issues.length === 0) {
    return [];
  }

  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id))];
  const reporterResult = await pool.query<Reporter>(
    'SELECT id, name, role FROM users WHERE id = ANY($1::int[])',
    [reporterIds]
  );

  const reporterMap = new Map<number, Reporter>();
  reporterResult.rows.forEach((reporter) => {
    reporterMap.set(reporter.id, reporter);
  });

  return issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterMap.get(issue.reporter_id) ?? null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
};

export const createIssue = async (input: CreateIssueInput): Promise<Issue> => {
  const reporter = await pool.query<Reporter>('SELECT id, name, role FROM users WHERE id = $1', [input.reporter_id]);

  if (reporter.rowCount === 0) {
    throw new AppError('Reporter does not exist', StatusCodes.BAD_REQUEST);
  }

  const result = await pool.query<Issue>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING ${issueColumns}`,
    [input.title, input.description, input.type, input.reporter_id]
  );

  const issue = result.rows[0];
  if (!issue) {
    throw new AppError('Issue creation failed', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return issue;
};

export const getAllIssues = async (filters: IssueFilters): Promise<IssueWithReporter[]> => {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderDirection = filters.sort === 'oldest' ? 'ASC' : 'DESC';

  const result = await pool.query<Issue>(
    `SELECT ${issueColumns} FROM issues ${whereClause} ORDER BY created_at ${orderDirection}`,
    values
  );

  return attachReporters(result.rows);
};

export const getIssueById = async (id: number): Promise<IssueWithReporter> => {
  const result = await pool.query<Issue>(`SELECT ${issueColumns} FROM issues WHERE id = $1`, [id]);
  const issue = result.rows[0];

  if (!issue) {
    throw new AppError('Issue not found', StatusCodes.NOT_FOUND);
  }

  const [issueWithReporter] = await attachReporters([issue]);
  if (!issueWithReporter) {
    throw new AppError('Issue not found', StatusCodes.NOT_FOUND);
  }

  return issueWithReporter;
};

export const getRawIssueById = async (id: number): Promise<Issue> => {
  const result = await pool.query<Issue>(`SELECT ${issueColumns} FROM issues WHERE id = $1`, [id]);
  const issue = result.rows[0];

  if (!issue) {
    throw new AppError('Issue not found', StatusCodes.NOT_FOUND);
  }

  return issue;
};

export const updateIssue = async (id: number, input: UpdateIssueBody, requester: Requester): Promise<Issue> => {
  const currentIssue = await getRawIssueById(id);

  const isMaintainer = requester.role === 'maintainer';
  const isOwner = currentIssue.reporter_id === requester.id;

  if (!isMaintainer) {
    if (!isOwner) {
      throw new AppError('Contributors can update only their own issues', StatusCodes.FORBIDDEN);
    }

    if (currentIssue.status !== 'open') {
      throw new AppError('Contributors can update only open issues', StatusCodes.CONFLICT);
    }

    if (input.status !== undefined) {
      throw new AppError('Only maintainers can update issue status', StatusCodes.FORBIDDEN);
    }
  }

  const nextTitle = input.title ?? currentIssue.title;
  const nextDescription = input.description ?? currentIssue.description;
  const nextType = input.type ?? currentIssue.type;
  const nextStatus = isMaintainer && input.status !== undefined ? input.status : currentIssue.status;

  const result = await pool.query<Issue>(
    `UPDATE issues
     SET title = $1,
         description = $2,
         type = $3,
         status = $4,
         updated_at = NOW()
     WHERE id = $5
     RETURNING ${issueColumns}`,
    [nextTitle, nextDescription, nextType, nextStatus, id]
  );

  const issue = result.rows[0];
  if (!issue) {
    throw new AppError('Issue update failed', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return issue;
};

export const deleteIssue = async (id: number): Promise<void> => {
  const result = await pool.query<Issue>('DELETE FROM issues WHERE id = $1 RETURNING id', [id]);

  if (result.rowCount === 0) {
    throw new AppError('Issue not found', StatusCodes.NOT_FOUND);
  }
};
