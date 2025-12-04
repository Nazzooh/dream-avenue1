// lib/response.ts — Standardized API response helpers
import type { Context } from "npm:hono";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Success response helper
 */
export const successResponse = <T>(
  c: Context,
  data: T,
  message?: string,
  status: number = 200
) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (message) response.message = message;
  return c.json(response, status);
};

/**
 * Error response helper
 */
export const errorResponse = (
  c: Context,
  error: string,
  status: number = 500
) => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return c.json(response, status);
};

/**
 * Validation error response helper
 */
export const validationErrorResponse = (
  c: Context,
  errors: any
) => {
  return c.json(
    {
      success: false,
      error: "Validation failed",
      details: errors,
    },
    400
  );
};

/**
 * Not found response helper
 */
export const notFoundResponse = (
  c: Context,
  resource: string
) => {
  return errorResponse(c, `${resource} not found`, 404);
};
