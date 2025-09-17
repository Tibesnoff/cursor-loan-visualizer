import { Loan, Payment, InterestAccrualMethod } from '../types';
import { calculateInterestBetweenDates } from './interestCalculations';
import { createError, ErrorType, safeCalculate } from './errorHandling';

/**
 * Calculates the effective starting balance for a loan when payments begin
 * This uses the payments start date as the baseline, not the loan start date
 */
export function calculateEffectiveStartingBalance(loan: Loan): number {
  return safeCalculate(
    () => {
      if (!loan || typeof loan.principal !== 'number') {
        throw createError(
          ErrorType.VALIDATION,
          'Invalid loan object provided',
          `Loan: ${JSON.stringify(loan)}`,
          'INVALID_LOAN'
        );
      }

      if (loan.principal < 0) {
        throw createError(
          ErrorType.VALIDATION,
          'Loan principal cannot be negative',
          `Principal: ${loan.principal}`,
          'INVALID_PRINCIPAL'
        );
      }

      if (!Number.isFinite(loan.principal)) {
        throw createError(
          ErrorType.VALIDATION,
          'Loan principal must be a finite number',
          `Principal: ${loan.principal}`,
          'INVALID_PRINCIPAL_TYPE'
        );
      }

      // The starting balance is always the principal amount when payments begin
      // Interest capitalization is handled by the loan servicer, not in our calculations
      return loan.principal;
    },
    0, // Fallback to 0 if calculation fails
    'Failed to calculate effective starting balance',
    'calculateEffectiveStartingBalance'
  );
}

/**
 * Applies a payment to a loan balance, following proper payment application order
 * Interest is paid first, then principal
 */
export function applyPaymentToBalance(
  balance: number,
  payment: Payment,
  interestRate: number,
  accrualMethod: InterestAccrualMethod,
  lastPaymentDate: Date
): { newBalance: number; interestPaid: number; principalPaid: number } {
  return safeCalculate(
    () => {
      // Input validation
      if (!payment || typeof payment.amount !== 'number') {
        throw createError(
          ErrorType.VALIDATION,
          'Invalid payment object provided',
          `Payment: ${JSON.stringify(payment)}`,
          'INVALID_PAYMENT'
        );
      }

      if (payment.amount < 0) {
        throw createError(
          ErrorType.VALIDATION,
          'Payment amount cannot be negative',
          `Amount: ${payment.amount}`,
          'INVALID_PAYMENT_AMOUNT'
        );
      }

      if (!Number.isFinite(payment.amount)) {
        throw createError(
          ErrorType.VALIDATION,
          'Payment amount must be a finite number',
          `Amount: ${payment.amount}`,
          'INVALID_PAYMENT_TYPE'
        );
      }

      if (balance < 0) {
        throw createError(
          ErrorType.VALIDATION,
          'Balance cannot be negative',
          `Balance: ${balance}`,
          'INVALID_BALANCE'
        );
      }

      if (!Number.isFinite(balance)) {
        throw createError(
          ErrorType.VALIDATION,
          'Balance must be a finite number',
          `Balance: ${balance}`,
          'INVALID_BALANCE_TYPE'
        );
      }

      if (
        !(lastPaymentDate instanceof Date) ||
        isNaN(lastPaymentDate.getTime())
      ) {
        throw createError(
          ErrorType.VALIDATION,
          'Invalid last payment date',
          `Date: ${lastPaymentDate}`,
          'INVALID_LAST_PAYMENT_DATE'
        );
      }

      if (!payment.paymentDate) {
        throw createError(
          ErrorType.VALIDATION,
          'Payment date is required',
          `Payment: ${JSON.stringify(payment)}`,
          'MISSING_PAYMENT_DATE'
        );
      }

      const paymentDate = new Date(payment.paymentDate);

      if (isNaN(paymentDate.getTime())) {
        throw createError(
          ErrorType.VALIDATION,
          'Invalid payment date',
          `Date: ${payment.paymentDate}`,
          'INVALID_PAYMENT_DATE'
        );
      }

      if (paymentDate < lastPaymentDate) {
        throw createError(
          ErrorType.VALIDATION,
          'Payment date cannot be before last payment date',
          `Payment: ${paymentDate.toISOString()}, Last: ${lastPaymentDate.toISOString()}`,
          'INVALID_PAYMENT_DATE_ORDER'
        );
      }

      // Calculate interest owed since last payment
      const interestOwed = calculateInterestBetweenDates(
        balance,
        interestRate,
        lastPaymentDate,
        paymentDate,
        accrualMethod
      );

      // Apply payment: interest first, then principal
      const interestPaid = Math.min(payment.amount, interestOwed);
      const principalPaid = Math.max(0, payment.amount - interestPaid);

      // Update balance
      const newBalance = Math.max(0, balance - principalPaid);

      // Validate results
      if (
        !Number.isFinite(newBalance) ||
        !Number.isFinite(interestPaid) ||
        !Number.isFinite(principalPaid)
      ) {
        throw createError(
          ErrorType.CALCULATION,
          'Payment calculation resulted in non-finite numbers',
          `Balance: ${balance}, Payment: ${payment.amount}, Interest: ${interestOwed}`,
          'CALCULATION_OVERFLOW'
        );
      }

      return {
        newBalance,
        interestPaid,
        principalPaid,
      };
    },
    { newBalance: balance, interestPaid: 0, principalPaid: 0 }, // Fallback values
    'Failed to apply payment to balance',
    'applyPaymentToBalance'
  );
}

/**
 * Calculates the monthly payment amount for a loan based on its type
 */
export function calculateMonthlyPayment(loan: Loan): number {
  return safeCalculate(
    () => {
      if (!loan) {
        throw createError(
          ErrorType.VALIDATION,
          'Loan object is required',
          'Loan is null or undefined',
          'MISSING_LOAN'
        );
      }

      if (loan.minimumPayment && loan.minimumPayment > 0) {
        if (loan.minimumPayment < 0) {
          throw createError(
            ErrorType.VALIDATION,
            'Minimum payment cannot be negative',
            `Minimum payment: ${loan.minimumPayment}`,
            'INVALID_MINIMUM_PAYMENT'
          );
        }
        return loan.minimumPayment;
      }

      if (loan.termMonths > 0) {
        // Standard amortization calculation for fixed-term loans
        const monthlyRate = loan.interestRate / 100 / 12;
        const principal = calculateEffectiveStartingBalance(loan);

        if (monthlyRate === 0) {
          if (loan.termMonths === 0) {
            throw createError(
              ErrorType.VALIDATION,
              'Cannot calculate payment with zero term months',
              `Term months: ${loan.termMonths}`,
              'INVALID_TERM_MONTHS'
            );
          }
          return principal / loan.termMonths;
        }

        const result =
          (principal *
            (monthlyRate * Math.pow(1 + monthlyRate, loan.termMonths))) /
          (Math.pow(1 + monthlyRate, loan.termMonths) - 1);

        if (!Number.isFinite(result)) {
          throw createError(
            ErrorType.CALCULATION,
            'Monthly payment calculation resulted in non-finite number',
            `Principal: ${principal}, Rate: ${monthlyRate}, Term: ${loan.termMonths}`,
            'CALCULATION_OVERFLOW'
          );
        }

        return result;
      }

      return 0; // No fixed payment for minimum payment only loans
    },
    0, // Fallback to 0 if calculation fails
    'Failed to calculate monthly payment',
    'calculateMonthlyPayment'
  );
}

/**
 * Determines if a loan should accrue interest during a specific period
 * Interest only accrues from the payments start date onwards
 */
export function shouldAccrueInterest(
  loan: Loan,
  _startDate: Date,
  _endDate: Date
): boolean {
  const paymentsStartDate = loan.paymentsStartDate
    ? new Date(loan.paymentsStartDate)
    : new Date(loan.startDate);

  // Interest only accrues from payments start date onwards
  return _endDate >= paymentsStartDate;
}

/**
 * Gets the effective interest rate for a loan period
 * Interest only applies from payments start date onwards
 */
export function getEffectiveInterestRate(
  loan: Loan,
  _startDate: Date,
  _endDate: Date
): number {
  const paymentsStartDate = loan.paymentsStartDate
    ? new Date(loan.paymentsStartDate)
    : new Date(loan.startDate);

  // Interest only applies from payments start date onwards
  if (_endDate >= paymentsStartDate) {
    return loan.interestRate;
  }
  return 0; // No interest accrual before payments start
}
