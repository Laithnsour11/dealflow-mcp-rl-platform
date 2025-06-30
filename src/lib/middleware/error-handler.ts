/**
 * Global error handler for API routes
 */

import { NextResponse } from 'next/server';

export interface APIError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

export function createAPIError(message: string, statusCode: number, code?: string, details?: any): APIError {
  const error = new Error(message) as APIError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

export function handleAPIError(error: any) {
  console.error('API Error:', {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    stack: error.stack,
    details: error.details
  });

  // Check for specific error types
  if (error.message?.includes('401') || error.statusCode === 401) {
    return NextResponse.json(
      {
        error: 'Authentication failed',
        message: 'Invalid or expired credentials. Please reconnect your GoHighLevel account.',
        code: 'AUTH_FAILED'
      },
      { status: 401 }
    );
  }

  if (error.message?.includes('429') || error.statusCode === 429) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMITED'
      },
      { status: 429 }
    );
  }

  if (error.message?.includes('OAuth') || error.message?.includes('token')) {
    return NextResponse.json(
      {
        error: 'OAuth error',
        message: 'OAuth authentication failed. Please reconnect your account.',
        code: 'OAUTH_ERROR'
      },
      { status: 401 }
    );
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;
  
  return NextResponse.json(
    {
      error: message,
      code: error.code || 'UNKNOWN_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.details })
    },
    { status: statusCode }
  );
}