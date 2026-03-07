import { describe, it, expect } from 'vitest';
import { ApiError, ApiErrors, createErrorResponse } from '@/lib/api-error';

describe('API Error Handling', () => {
  describe('ApiError', () => {
    it('should create an ApiError with all properties', () => {
      const error = new ApiError(400, 'Test error', 'TEST_ERROR', { field: 'value' });

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'value' });
      expect(error.name).toBe('ApiError');
    });
  });

  describe('ApiErrors', () => {
    it('should create Unauthorized error', () => {
      const error = ApiErrors.Unauthorized();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create Forbidden error', () => {
      const error = ApiErrors.Forbidden();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should create NotFound error', () => {
      const error = ApiErrors.NotFound('User');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should create BadRequest error', () => {
      const error = ApiErrors.BadRequest('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should create ValidationError with details', () => {
      const error = ApiErrors.ValidationError({ email: 'Invalid email' });
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ email: 'Invalid email' });
    });
  });

  describe('createErrorResponse', () => {
    it('should create response from ApiError', () => {
      const error = new ApiError(400, 'Test error', 'TEST_CODE');
      const response = createErrorResponse(error);

      expect(response.error).toBe('Test error');
      expect(response.code).toBe('TEST_CODE');
      expect(response.timestamp).toBeDefined();
    });

    it('should create response from regular Error', () => {
      const error = new Error('Regular error');
      const response = createErrorResponse(error);

      expect(response.error).toBeDefined();
      expect(response.code).toBe('INTERNAL_ERROR');
      expect(response.timestamp).toBeDefined();
    });

    it('should create response from unknown error', () => {
      const response = createErrorResponse('string error');

      expect(response.error).toBe('An unexpected error occurred');
      expect(response.code).toBe('UNKNOWN_ERROR');
      expect(response.timestamp).toBeDefined();
    });
  });
});
