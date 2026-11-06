export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly expose: boolean;

  constructor(code: string, message: string, status = 400, expose = false) {
    super(message);
    this.code = code;
    this.status = status;
    this.expose = expose;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401, false);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403, false);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super("NOT_FOUND", message, 404, false);
  }
}

export function publicErrorMessage(err: unknown): string {
  if (err instanceof AppError && err.expose) return err.message;
  return "Something went wrong. Please try again.";
}
