import { InterestAccrualMethod } from '../types';

/**
 * Calculate interest based on the selected accrual method
 */
export const calculateInterest = (
  balance: number,
  interestRate: number,
  days: number,
  method: InterestAccrualMethod
): number => {
  if (method === 'daily') {
    // Daily interest calculation (like student loans)
    const dailyRate = interestRate / 100 / 365.25;
    return balance * dailyRate * days;
  } else {
    // Monthly interest calculation (traditional loans)
    const monthlyRate = interestRate / 100 / 12;
    const months = days / 30.44; // Average days per month
    return balance * monthlyRate * months;
  }
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
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return calculateInterest(balance, interestRate, days, method);
};
