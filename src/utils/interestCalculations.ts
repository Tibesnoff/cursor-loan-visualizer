import { InterestAccrualMethod } from '../types';
import { createError, ErrorType, safeCalculate } from './errorHandling';

/**
 * Calculate interest based on the selected accrual method
 */
export const calculateInterest = (
  balance: number,
  interestRate: number,
  days: number,
  method: InterestAccrualMethod
): number => {
  return safeCalculate(
    () => {
      // Input validation
      if (balance < 0) {
        throw createError(
          ErrorType.VALIDATION,
          'Balance cannot be negative',
          `Balance: ${balance}`,
          'INVALID_BALANCE'
        );
      }
      if (interestRate < 0) {
        throw createError(
          ErrorType.VALIDATION,
          'Interest rate cannot be negative',
          `Interest rate: ${interestRate}`,
          'INVALID_INTEREST_RATE'
        );
      }
      if (days < 0) {
        throw createError(
          ErrorType.VALIDATION,
          'Days cannot be negative',
          `Days: ${days}`,
          'INVALID_DAYS'
        );
      }
      if (
        !Number.isFinite(balance) ||
        !Number.isFinite(interestRate) ||
        !Number.isFinite(days)
      ) {
        throw createError(
          ErrorType.VALIDATION,
          'All parameters must be finite numbers',
          `Balance: ${balance}, Rate: ${interestRate}, Days: ${days}`,
          'INVALID_NUMBERS'
        );
      }

      // Handle zero values
      if (balance === 0 || interestRate === 0 || days === 0) {
        return 0;
      }

      let result: number;

      if (method === 'daily') {
        // Daily interest calculation (like student loans)
        const dailyRate = interestRate / 100 / 365.25;
        result = balance * dailyRate * days;
      } else {
        // Monthly interest calculation (traditional loans)
        const monthlyRate = interestRate / 100 / 12;
        const months = days / 30.44; // Average days per month
        result = balance * monthlyRate * months;
      }

      if (!Number.isFinite(result)) {
        throw createError(
          ErrorType.CALCULATION,
          'Interest calculation resulted in non-finite number',
          `Balance: ${balance}, Rate: ${interestRate}, Days: ${days}, Method: ${method}`,
          'CALCULATION_OVERFLOW'
        );
      }

      return result;
    },
    0, // Fallback to 0 if calculation fails
    'Failed to calculate interest',
    'calculateInterest'
  );
};

/**
 * Calculate interest between two dates
 */
export const calculateInterestBetweenDates = (
  balance: number,
  interestRate: number,
  startDate: Date,
  endDate: Date,
  method: InterestAccrualMethod
): number => {
  return safeCalculate(
    () => {
      // Validate dates
      if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
        throw createError(
          ErrorType.VALIDATION,
          'Invalid date objects provided',
          `Start: ${startDate}, End: ${endDate}`,
          'INVALID_DATES'
        );
      }

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw createError(
          ErrorType.VALIDATION,
          'Invalid date values',
          `Start: ${startDate}, End: ${endDate}`,
          'INVALID_DATE_VALUES'
        );
      }

      if (endDate < startDate) {
        throw createError(
          ErrorType.VALIDATION,
          'End date cannot be before start date',
          `Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`,
          'INVALID_DATE_RANGE'
        );
      }

      const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return calculateInterest(balance, interestRate, days, method);
    },
    0, // Fallback to 0 if calculation fails
    'Failed to calculate interest between dates',
    'calculateInterestBetweenDates'
  );
};
