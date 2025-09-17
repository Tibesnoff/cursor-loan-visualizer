import { message } from 'antd';

// Error types for better error handling
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  CALCULATION = 'CALCULATION',
  DATA = 'DATA',
  NETWORK = 'NETWORK',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN',
}

// Strict error interface with readonly properties
export interface AppError extends Error {
  readonly type: ErrorType;
  readonly message: string;
  readonly details?: string;
  readonly code?: string;
  readonly timestamp: Date;
  readonly stack?: string;
}

// Error context type for better error tracking
export interface ErrorContext {
  readonly component?: string;
  readonly function?: string;
  readonly userId?: string;
  readonly loanId?: string;
  readonly paymentId?: string;
  readonly additionalData?: Record<string, unknown>;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Enhanced error interface with severity
export interface EnhancedAppError extends AppError {
  readonly severity: ErrorSeverity;
  readonly context?: ErrorContext;
  readonly recoverable: boolean;
}

// Error factory function with strict typing
export function createError(
  type: ErrorType,
  message: string,
  details?: string,
  code?: string
): AppError {
  const error = new Error(message) as AppError;
  // Use Object.assign to avoid readonly property issues
  Object.assign(error, {
    type,
    message,
    details,
    code,
    timestamp: new Date(),
  });
  return error;
}

// Enhanced error factory with context
export function createEnhancedError(
  type: ErrorType,
  message: string,
  severity: ErrorSeverity,
  context?: ErrorContext,
  details?: string,
  code?: string
): EnhancedAppError {
  const baseError = createError(type, message, details, code);
  return {
    ...baseError,
    severity,
    context,
    recoverable: severity !== ErrorSeverity.CRITICAL,
  };
}

// Error logging utility with strict typing
export function logError(
  error: AppError | EnhancedAppError,
  context?: string
): void {
  const errorMessage = context
    ? `[${context}] ${error.message}`
    : error.message;

  const logData: Record<string, unknown> = {
    type: error.type,
    message: errorMessage,
    details: error.details,
    code: error.code,
    timestamp: error.timestamp,
  };

  // Add enhanced error properties if available
  if ('severity' in error) {
    logData.severity = error.severity;
    logData.recoverable = error.recoverable;
    if (error.context) {
      logData.context = error.context;
    }
  }

  console.error('Application Error:', logData);
}

// Error display utility
export function displayError(error: AppError, context?: string): void {
  const errorMessage = context ? `${context}: ${error.message}` : error.message;

  message.error(errorMessage);
  logError(error, context);
}

// Safe calculation wrapper with strict typing
export function safeCalculate<T>(
  calculation: () => T,
  fallback: T,
  errorMessage: string,
  context?: string
): T {
  try {
    return calculation();
  } catch (error) {
    const appError = createError(
      ErrorType.CALCULATION,
      errorMessage,
      error instanceof Error ? error.message : 'Unknown calculation error',
      'SAFE_CALC_ERROR'
    );

    logError(appError, context);
    return fallback;
  }
}

// Safe calculation with enhanced error handling
export function safeCalculateWithContext<T>(
  calculation: () => T,
  fallback: T,
  errorMessage: string,
  context: ErrorContext
): T {
  try {
    return calculation();
  } catch (error) {
    const enhancedError = createEnhancedError(
      ErrorType.CALCULATION,
      errorMessage,
      ErrorSeverity.MEDIUM,
      context,
      error instanceof Error ? error.message : 'Unknown calculation error',
      'SAFE_CALC_CONTEXT_ERROR'
    );

    logError(enhancedError, context.component);
    return fallback;
  }
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  errorMessage: string,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = createError(
      ErrorType.UNKNOWN,
      errorMessage,
      error instanceof Error ? error.message : 'Unknown async error'
    );

    logError(appError, context);
    return fallback;
  }
}

// Validation error helpers
export function createValidationError(
  field: string,
  message: string
): AppError {
  return createError(
    ErrorType.VALIDATION,
    `Validation error for ${field}: ${message}`,
    undefined,
    'VALIDATION_ERROR'
  );
}

// Data error helpers
export function createDataError(operation: string, message: string): AppError {
  return createError(
    ErrorType.DATA,
    `Data error during ${operation}: ${message}`,
    undefined,
    'DATA_ERROR'
  );
}

// Storage error helpers
export function createStorageError(
  operation: string,
  message: string
): AppError {
  return createError(
    ErrorType.STORAGE,
    `Storage error during ${operation}: ${message}`,
    undefined,
    'STORAGE_ERROR'
  );
}

// Error boundary helper
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'timestamp' in error
  );
}

// Error recovery strategies
export function getErrorRecoveryMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.CALCULATION:
      return 'There was an error calculating loan data. Please refresh and try again.';
    case ErrorType.DATA:
      return 'There was an error processing your data. Please try again.';
    case ErrorType.STORAGE:
      return 'There was an error saving your data. Please try again.';
    case ErrorType.NETWORK:
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
