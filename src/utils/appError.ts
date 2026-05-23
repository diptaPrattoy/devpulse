export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors?: string | string[];

  public constructor(message: string, statusCode: number, errors?: string | string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
