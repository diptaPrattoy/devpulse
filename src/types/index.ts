export type UserRole = 'contributor' | 'maintainer';
export type IssueType = 'bug' | 'feature_request';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type IssueSort = 'newest' | 'oldest';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id: number;
  name: string;
  role: UserRole;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Reporter {
  id: number;
  name: string;
  role: UserRole;
}

export interface IssueWithReporter extends Omit<Issue, 'reporter_id'> {
  reporter: Reporter | null;
}

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateIssueBody {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}
