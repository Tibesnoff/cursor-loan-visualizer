import { Loan, Payment, InterestAccrualMethod } from '../types';
import { calculateInterestBetweenDates } from './interestCalculations';

/**
 * Calculates the effective starting balance for a loan when payments begin
 * This uses the payments start date as the baseline, not the loan start date
 */
export function calculateEffectiveStartingBalance(loan: Loan): number {
  // The starting balance is always the principal amount when payments begin
  // Interest capitalization is handled by the loan servicer, not in our calculations
  return loan.principal;
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
  const paymentDate = new Date(payment.paymentDate);

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

  return {
    newBalance,
    interestPaid,
    principalPaid,
  };
}

/**
 * Calculates the monthly payment amount for a loan based on its type
 */
export function calculateMonthlyPayment(loan: Loan): number {
  if (loan.minimumPayment && loan.minimumPayment > 0) {
    return loan.minimumPayment;
  }

  if (loan.termMonths > 0) {
    // Standard amortization calculation for fixed-term loans
    const monthlyRate = loan.interestRate / 100 / 12;
    const principal = calculateEffectiveStartingBalance(loan);

    if (monthlyRate === 0) {
      return principal / loan.termMonths;
    }

    return (
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, loan.termMonths))) /
      (Math.pow(1 + monthlyRate, loan.termMonths) - 1)
    );
  }

  return 0; // No fixed payment for minimum payment only loans
}

/**
 * Determines if a loan should accrue interest during a specific period
 * Interest only accrues from the payments start date onwards
 */
export function shouldAccrueInterest(
  loan: Loan,
  startDate: Date,
  endDate: Date
): boolean {
  const paymentsStartDate = loan.paymentsStartDate ? new Date(loan.paymentsStartDate) : new Date(loan.startDate);
  
  // Interest only accrues from payments start date onwards
  return endDate >= paymentsStartDate;
}

/**
 * Gets the effective interest rate for a loan period
 * Interest only applies from payments start date onwards
 */
export function getEffectiveInterestRate(
  loan: Loan,
  startDate: Date,
  endDate: Date
): number {
  const paymentsStartDate = loan.paymentsStartDate ? new Date(loan.paymentsStartDate) : new Date(loan.startDate);
  
  // Interest only applies from payments start date onwards
  if (endDate >= paymentsStartDate) {
    return loan.interestRate;
  }
  return 0; // No interest accrual before payments start
}
