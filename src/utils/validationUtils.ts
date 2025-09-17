import { Loan, Payment, User } from '../types';

/**
 * Shared validation utilities to reduce duplication across forms and components
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule<T> {
  validate: (value: T) => ValidationResult;
  message: string;
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: <T>(
    message: string = 'This field is required'
  ): ValidationRule<T> => ({
    validate: (value: T) => ({
      isValid: value !== null && value !== undefined && value !== '',
      error:
        value === null || value === undefined || value === ''
          ? message
          : undefined,
    }),
    message,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => ({
      isValid: value >= min,
      error:
        value < min ? message || `Value must be at least ${min}` : undefined,
    }),
    message: message || `Value must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => ({
      isValid: value <= max,
      error:
        value > max ? message || `Value must be at most ${max}` : undefined,
    }),
    message: message || `Value must be at most ${max}`,
  }),

  range: (
    min: number,
    max: number,
    message?: string
  ): ValidationRule<number> => ({
    validate: (value: number) => ({
      isValid: value >= min && value <= max,
      error:
        value < min || value > max
          ? message || `Value must be between ${min} and ${max}`
          : undefined,
    }),
    message: message || `Value must be between ${min} and ${max}`,
  }),

  email: (
    message: string = 'Please enter a valid email address'
  ): ValidationRule<string> => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(value),
        error: !emailRegex.test(value) ? message : undefined,
      };
    },
    message,
  }),

  positiveNumber: (
    message: string = 'Value must be a positive number'
  ): ValidationRule<number> => ({
    validate: (value: number) => ({
      isValid: value > 0 && Number.isFinite(value),
      error: value <= 0 || !Number.isFinite(value) ? message : undefined,
    }),
    message,
  }),

  nonNegativeNumber: (
    message: string = 'Value must be a non-negative number'
  ): ValidationRule<number> => ({
    validate: (value: number) => ({
      isValid: value >= 0 && Number.isFinite(value),
      error: value < 0 || !Number.isFinite(value) ? message : undefined,
    }),
    message,
  }),

  futureDate: (
    message: string = 'Date cannot be in the future'
  ): ValidationRule<Date> => ({
    validate: (value: Date) => ({
      isValid: value <= new Date(),
      error: value > new Date() ? message : undefined,
    }),
    message,
  }),

  pastDate: (
    message: string = 'Date cannot be in the past'
  ): ValidationRule<Date> => ({
    validate: (value: Date) => ({
      isValid: value >= new Date(),
      error: value < new Date() ? message : undefined,
    }),
    message,
  }),
};

/**
 * Validates a value against multiple rules
 */
export function validateValue<T>(
  value: T,
  rules: ValidationRule<T>[]
): ValidationResult {
  for (const rule of rules) {
    const result = rule.validate(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}

/**
 * Validates a loan object
 */
export function validateLoan(loan: Partial<Loan>): ValidationResult {
  const errors: string[] = [];

  if (!loan.name || loan.name.trim() === '') {
    errors.push('Loan name is required');
  }

  if (!loan.principal || loan.principal <= 0) {
    errors.push('Principal amount must be greater than 0');
  }

  if (
    loan.interestRate === undefined ||
    loan.interestRate < 0 ||
    loan.interestRate > 100
  ) {
    errors.push('Interest rate must be between 0 and 100');
  }

  if (loan.termMonths !== undefined && loan.termMonths < 0) {
    errors.push('Term months cannot be negative');
  }

  if (loan.minimumPayment !== undefined && loan.minimumPayment < 0) {
    errors.push('Minimum payment cannot be negative');
  }

  if (
    loan.paymentDueDay !== undefined &&
    (loan.paymentDueDay < 1 || loan.paymentDueDay > 31)
  ) {
    errors.push('Payment due day must be between 1 and 31');
  }

  if (
    loan.gracePeriodMonths !== undefined &&
    (loan.gracePeriodMonths < 0 || loan.gracePeriodMonths > 24)
  ) {
    errors.push('Grace period must be between 0 and 24 months');
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join(', ') : undefined,
  };
}

/**
 * Validates a payment object
 */
export function validatePayment(payment: Partial<Payment>): ValidationResult {
  const errors: string[] = [];

  if (!payment.loanId || payment.loanId.trim() === '') {
    errors.push('Loan ID is required');
  }

  if (!payment.amount || payment.amount <= 0) {
    errors.push('Payment amount must be greater than 0');
  }

  if (!payment.paymentDate) {
    errors.push('Payment date is required');
  } else if (payment.paymentDate > new Date()) {
    errors.push('Payment date cannot be in the future');
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join(', ') : undefined,
  };
}

/**
 * Validates a user object
 */
export function validateUser(user: Partial<User>): ValidationResult {
  const errors: string[] = [];

  if (!user.name || user.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!user.email || user.email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailResult = ValidationRules.email().validate(user.email);
    if (!emailResult.isValid) {
      errors.push(emailResult.error!);
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors.join(', ') : undefined,
  };
}

/**
 * Creates Ant Design form validation rules from validation rules
 */
export function createAntdRules<T>(rules: ValidationRule<T>[]) {
  return rules.map(rule => ({
    validator: (_: any, value: T) => {
      const result = rule.validate(value);
      if (!result.isValid) {
        return Promise.reject(new Error(result.error!));
      }
      return Promise.resolve();
    },
  }));
}
