import { Loan, Payment } from '../types';

/**
 * Pure utility functions for calculating statistics
 * These are stateless functions that can be used anywhere
 */

export interface LoanStatistics {
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  paymentCount: number;
  averagePayment: number;
  lastPaymentDate: Date | null;
}

export interface PaymentStatistics {
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  averagePayment: number;
  paymentCount: number;
  lastPaymentDate: Date | null;
}

export interface UserStatistics {
  loanCount: number;
  totalLoanAmount: number;
  totalPaid: number;
  totalInterestPaid: number;
  averageLoanAmount: number;
  averagePayment: number;
}

/**
 * Calculates loan statistics from payments
 */
export function calculateLoanStatistics(
  loan: Loan,
  payments: Payment[]
): LoanStatistics {
  const loanPayments = payments.filter(p => p.loanId === loan.id);

  if (loanPayments.length === 0) {
    return {
      totalPaid: 0,
      principalPaid: 0,
      interestPaid: 0,
      remainingBalance: loan.principal,
      paymentCount: 0,
      averagePayment: 0,
      lastPaymentDate: null,
    };
  }

  const totalPaid = loanPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const principalPaid = loanPayments.reduce(
    (sum, payment) => sum + payment.principalAmount,
    0
  );
  const interestPaid = loanPayments.reduce(
    (sum, payment) => sum + payment.interestAmount,
    0
  );
  const averagePayment = totalPaid / loanPayments.length;

  const lastPayment = loanPayments.sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )[0];

  return {
    totalPaid,
    principalPaid,
    interestPaid,
    remainingBalance: loan.principal - principalPaid,
    paymentCount: loanPayments.length,
    averagePayment,
    lastPaymentDate: lastPayment.paymentDate,
  };
}

/**
 * Calculates payment statistics for a loan
 */
export function calculatePaymentStatistics(
  loan: Loan,
  payments: Payment[]
): PaymentStatistics {
  const loanPayments = payments.filter(p => p.loanId === loan.id);

  if (loanPayments.length === 0) {
    return {
      totalPaid: 0,
      principalPaid: 0,
      interestPaid: 0,
      averagePayment: 0,
      paymentCount: 0,
      lastPaymentDate: null,
    };
  }

  const totalPaid = loanPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const principalPaid = loanPayments.reduce(
    (sum, payment) => sum + payment.principalAmount,
    0
  );
  const interestPaid = loanPayments.reduce(
    (sum, payment) => sum + payment.interestAmount,
    0
  );
  const averagePayment = totalPaid / loanPayments.length;

  const lastPayment = loanPayments.sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  )[0];

  return {
    totalPaid,
    principalPaid,
    interestPaid,
    averagePayment,
    paymentCount: loanPayments.length,
    lastPaymentDate: lastPayment.paymentDate,
  };
}

/**
 * Calculates user statistics from loans and payments
 */
export function calculateUserStatistics(
  user: any,
  loans: Loan[],
  payments: Payment[]
): UserStatistics {
  const userLoans = loans.filter(loan => loan.userId === user.id);
  const userPayments = payments.filter(payment =>
    userLoans.some(loan => loan.id === payment.loanId)
  );

  const totalLoanAmount = userLoans.reduce(
    (sum, loan) => sum + loan.principal,
    0
  );
  const totalPaid = userPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const totalInterestPaid = userPayments.reduce(
    (sum, payment) => sum + payment.interestAmount,
    0
  );

  return {
    loanCount: userLoans.length,
    totalLoanAmount,
    totalPaid,
    totalInterestPaid,
    averageLoanAmount:
      userLoans.length > 0 ? totalLoanAmount / userLoans.length : 0,
    averagePayment:
      userPayments.length > 0 ? totalPaid / userPayments.length : 0,
  };
}

/**
 * Calculates statistics for multiple loans
 */
export function calculateMultipleLoanStatistics(
  loans: Loan[],
  payments: Payment[]
): {
  totalLoans: number;
  totalLoanAmount: number;
  totalPaid: number;
  totalInterestPaid: number;
  averageLoanAmount: number;
  averagePayment: number;
} {
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.principal, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInterestPaid = payments.reduce(
    (sum, payment) => sum + payment.interestAmount,
    0
  );

  return {
    totalLoans: loans.length,
    totalLoanAmount,
    totalPaid,
    totalInterestPaid,
    averageLoanAmount: loans.length > 0 ? totalLoanAmount / loans.length : 0,
    averagePayment: payments.length > 0 ? totalPaid / payments.length : 0,
  };
}
