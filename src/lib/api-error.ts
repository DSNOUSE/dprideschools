/**
 * Standardized API Error Handling
 * 
 * Provides consistent error responses across all API routes
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

export function createErrorResponse(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): ApiErrorResponse {
  const timestamp = new Date().toISOString();
  
  if (error instanceof ApiError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
    };
  }
  
  if (error instanceof Error) {
    return {
      error: process.env.NODE_ENV === 'development' ? error.message : defaultMessage,
      code: 'INTERNAL_ERROR',
      timestamp,
    };
  }
  
  return {
    error: defaultMessage,
    code: 'UNKNOWN_ERROR',
    timestamp,
  };
}

// Common API errors
export const ApiErrors = {
  Unauthorized: () => new ApiError(401, 'Authentication required', 'UNAUTHORIZED'),
  Forbidden: () => new ApiError(403, 'Insufficient permissions', 'FORBIDDEN'),
  NotFound: (resource = 'Resource') => new ApiError(404, `${resource} not found`, 'NOT_FOUND'),
  BadRequest: (message: string) => new ApiError(400, message, 'BAD_REQUEST'),
  Conflict: (message: string) => new ApiError(409, message, 'CONFLICT'),
  ValidationError: (details: unknown) => new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', details),
  InternalError: (message = 'Internal server error') => new ApiError(500, message, 'INTERNAL_ERROR'),
};
