export type AppErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DB_ERROR'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'UNKNOWN';

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly originalError?: unknown;

  constructor(message: string, code: AppErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
    // Maintains proper stack trace in V8 (not available in Hermes/RN)
    const captureStackTrace = (Error as unknown as { captureStackTrace?: (t: object, c: unknown) => void }).captureStackTrace;
    if (captureStackTrace) {
      captureStackTrace(this, AppError);
    }
  }

  static notFound(entity: string, id?: string): AppError {
    return new AppError(
      `${entity}${id ? ` with id "${id}"` : ''} not found`,
      'NOT_FOUND',
    );
  }

  static validation(message: string): AppError {
    return new AppError(message, 'VALIDATION_ERROR');
  }

  static db(message: string, cause?: unknown): AppError {
    return new AppError(message, 'DB_ERROR', cause);
  }

  static network(message: string, cause?: unknown): AppError {
    return new AppError(message, 'NETWORK_ERROR', cause);
  }
}
