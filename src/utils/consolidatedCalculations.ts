import { Loan, Payment, InterestAccrualMethod } from '../types';
import { createError, ErrorType, safeCalculate } from './errorHandling';
import {
  applyPaymentWithLoanTypeRules,
  InterestCalculationContext,
} from './loanInterestRules';

/**
 * Consolidated loan calculation utilities
 * All calculation logic should go through these functions to ensure consistency
 */

/**
 * Ensures all date fields in a loan are proper Date objects
 */
export function normalizeLoanDates(loan: Loan): Loan {
  return {
    ...loan,
    disbursementDate: new Date(loan.disbursementDate),
    interestStartDate: new Date(loan.interestStartDate),
    firstPaymentDueDate: new Date(loan.firstPaymentDueDate),
    createdAt: new Date(loan.createdAt),
    updatedAt: new Date(loan.updatedAt),
  };
}

/**
 * Ensures all date fields in a payment are proper Date objects
 */
export function normalizePaymentDates(payment: Payment): Payment {
  return {
    ...payment,
    paymentDate: new Date(payment.paymentDate),
    createdAt: new Date(payment.createdAt),
  };
}

/**
 * Calculates the effective starting balance for a loan
 * This is always the principal amount - interest capitalization is handled by the servicer
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

      return loan.principal;
    },
    0,
    'Failed to calculate effective starting balance',
    'calculateEffectiveStartingBalance'
  );
}

/**
 * Applies a payment to a loan balance using the consolidated calculation logic
 * This is the single source of truth for payment application
 */
export function applyPaymentToBalance(
  balance: number,
  payment: Payment,
  loan: Loan,
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

      // Normalize the loan to ensure all dates are Date objects
      const normalizedLoan = normalizeLoanDates(loan);

      // Use loan type-specific rules for interest calculation
      const context: InterestCalculationContext = {
        loan: normalizedLoan,
        paymentDate,
        lastPaymentDate,
        currentBalance: balance,
      };

      const result = applyPaymentWithLoanTypeRules(context, payment.amount);

      // Validate results
      if (
        !Number.isFinite(result.newBalance) ||
        !Number.isFinite(result.interestPaid) ||
        !Number.isFinite(result.principalPayment)
      ) {
        throw createError(
          ErrorType.CALCULATION,
          'Payment calculation resulted in non-finite numbers',
          `Balance: ${balance}, Payment: ${payment.amount}, Interest: ${result.interestOwed}`,
          'CALCULATION_OVERFLOW'
        );
      }

      return {
        newBalance: result.newBalance,
        interestPaid: result.interestPaid,
        principalPaid: result.principalPayment,
      };
    },
    { newBalance: balance, interestPaid: 0, principalPaid: 0 },
    'Failed to apply payment to balance',
    'applyPaymentToBalance'
  );
}

/**
 * Calculates the monthly payment amount for a loan
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
    0,
    'Failed to calculate monthly payment',
    'calculateMonthlyPayment'
  );
}

/**
 * Calculates interest between two dates using the loan's accrual method
 */
export function calculateInterestBetweenDates(
  balance: number,
  interestRate: number,
  startDate: Date,
  endDate: Date,
  method: InterestAccrualMethod
): number {
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

      // Handle zero values
      if (balance === 0 || interestRate === 0) {
        return 0;
      }

      let result: number;

      if (method === 'daily') {
        // Daily interest calculation
        const days = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const dailyRate = interestRate / 100 / 365.25;
        result = balance * dailyRate * days;
      } else {
        // Monthly interest calculation
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();

        const months = (endYear - startYear) * 12 + (endMonth - startMonth);
        const monthlyRate = interestRate / 100 / 12;
        result = balance * monthlyRate * months;
      }

      if (!Number.isFinite(result)) {
        throw createError(
          ErrorType.CALCULATION,
          'Interest calculation resulted in non-finite number',
          `Balance: ${balance}, Rate: ${interestRate}, Method: ${method}`,
          'CALCULATION_OVERFLOW'
        );
      }

      return result;
    },
    0,
    'Failed to calculate interest between dates',
    'calculateInterestBetweenDates'
  );
}

/**
 * Processes all payments for a loan and returns the final balance and totals
 * This is the single source of truth for loan balance calculations
 */
export function processAllPayments(
  loan: Loan,
  payments: Payment[]
): {
  finalBalance: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  totalPaid: number;
} {
  return safeCalculate(
    () => {
      const normalizedLoan = normalizeLoanDates(loan);
      const normalizedPayments = payments
        .filter(p => p.loanId === loan.id)
        .map(normalizePaymentDates)
        .sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime());

      let balance = calculateEffectiveStartingBalance(normalizedLoan);
      let totalInterestPaid = 0;
      let totalPrincipalPaid = 0;
      let totalPaid = 0;

      // Use interest start date as the baseline for interest calculations
      let lastPaymentDate = normalizedLoan.interestStartDate;

      // Process payments in chronological order
      for (const payment of normalizedPayments) {
        const paymentResult = applyPaymentToBalance(
          balance,
          payment,
          normalizedLoan,
          lastPaymentDate
        );

        balance = paymentResult.newBalance;
        totalInterestPaid += paymentResult.interestPaid;
        totalPrincipalPaid += paymentResult.principalPaid;
        totalPaid += payment.amount;
        lastPaymentDate = payment.paymentDate;
      }

      return {
        finalBalance: balance,
        totalInterestPaid,
        totalPrincipalPaid,
        totalPaid,
      };
    },
    {
      finalBalance: loan.principal,
      totalInterestPaid: 0,
      totalPrincipalPaid: 0,
      totalPaid: 0,
    },
    'Failed to process all payments',
    'processAllPayments'
  );
}
