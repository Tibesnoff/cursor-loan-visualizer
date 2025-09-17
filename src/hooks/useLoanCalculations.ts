import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import {
  normalizeLoanDates,
  calculateEffectiveStartingBalance,
  applyPaymentToBalance,
  calculateMonthlyPayment,
  processAllPayments,
} from '../utils/consolidatedCalculations';
import {
  createError,
  ErrorType,
  safeCalculate,
  logError,
} from '../utils/errorHandling';
import { createStableArray, limitArraySize } from '../utils/memoryUtils';
import { useCleanup } from './useCleanup';

export const useLoanCalculations = (loan: Loan, loanPayments: Payment[]) => {
  // Use shared cleanup hook
  useCleanup();

  // Input validation
  if (!loan) {
    const error = createError(
      ErrorType.VALIDATION,
      'Loan object is required for calculations',
      'Loan is null or undefined',
      'MISSING_LOAN'
    );
    logError(error, 'useLoanCalculations');
    throw error;
  }

  if (!Array.isArray(loanPayments)) {
    const error = createError(
      ErrorType.VALIDATION,
      'Loan payments must be an array',
      `Payments: ${typeof loanPayments}`,
      'INVALID_PAYMENTS_ARRAY'
    );
    logError(error, 'useLoanCalculations');
    throw error;
  }

  const monthlyRate = safeCalculate(
    () => loan.interestRate / 100 / 12,
    0,
    'Failed to calculate monthly rate',
    'useLoanCalculations'
  );

  const disbursementDate = safeCalculate(
    () => new Date(loan.disbursementDate),
    new Date(),
    'Failed to parse loan disbursement date',
    'useLoanCalculations'
  );

  const interestStartDate = safeCalculate(
    () => new Date(loan.interestStartDate),
    disbursementDate,
    'Failed to parse interest start date',
    'useLoanCalculations'
  );

  const firstPaymentDueDate = safeCalculate(
    () => new Date(loan.firstPaymentDueDate),
    disbursementDate,
    'Failed to parse first payment due date',
    'useLoanCalculations'
  );

  // Calculate monthly payment amount
  const monthlyPaymentAmount = useMemo(() => {
    return calculateMonthlyPayment(loan);
  }, [loan]);

  // Get payments for a specific month
  const getPaymentsForMonth = (monthIndex: number) => {
    const monthStart = new Date(
      firstPaymentDueDate.getFullYear(),
      firstPaymentDueDate.getMonth() + monthIndex,
      1
    );
    const monthEnd = new Date(
      firstPaymentDueDate.getFullYear(),
      firstPaymentDueDate.getMonth() + monthIndex + 1,
      0
    );

    return loanPayments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return (
        payment.loanId === loan.id &&
        paymentDate >= monthStart &&
        paymentDate <= monthEnd
      );
    });
  };

  // Get payments for the first payment due date
  const getFirstPaymentDueDatePayments = () => {
    return loanPayments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const firstDue = new Date(firstPaymentDueDate);
      return (
        payment.loanId === loan.id &&
        paymentDate.getFullYear() === firstDue.getFullYear() &&
        paymentDate.getMonth() === firstDue.getMonth() &&
        paymentDate.getDate() === firstDue.getDate()
      );
    });
  };

  // Memoize filtered payments to prevent unnecessary recalculations
  const relevantPayments = useMemo(() => {
    const limitedPayments = limitArraySize(loanPayments, 1000); // Limit to 1000 payments
    return createStableArray(limitedPayments).filter(
      payment => payment.loanId === loan.id
    );
  }, [loanPayments, loan.id]);

  // Memoize sorted payments to prevent unnecessary sorting
  const sortedPayments = useMemo(() => {
    return [...createStableArray(relevantPayments)].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );
  }, [relevantPayments]);

  // Calculate actual loan statistics using consolidated logic
  const actualLoanStats = useMemo(() => {
    const result = processAllPayments(loan, relevantPayments);

    return {
      totalPaid: result.totalPaid,
      principalPaid: result.totalPrincipalPaid,
      interestPaid: result.totalInterestPaid,
      remainingBalance: result.finalBalance,
    };
  }, [loan, relevantPayments]);

  // Calculate additional spent over minimum
  const additionalSpentOverMinimum = useMemo(() => {
    const relevantPayments = loanPayments.filter(
      payment => payment.loanId === loan.id
    );

    if (relevantPayments.length === 0) return 0;

    const totalPaid = relevantPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const currentDate = new Date();
    const monthsSinceStart = Math.max(
      1,
      (currentDate.getFullYear() - firstPaymentDueDate.getFullYear()) * 12 +
        (currentDate.getMonth() - firstPaymentDueDate.getMonth()) +
        1
    );

    const minimumAmount = monthlyPaymentAmount;
    const expectedMinimum = minimumAmount * monthsSinceStart;

    return Math.max(0, totalPaid - expectedMinimum);
  }, [loanPayments, loan.id, monthlyPaymentAmount, firstPaymentDueDate]);

  // Calculate last payment breakdown
  const lastPaymentBreakdown = useMemo(() => {
    if (relevantPayments.length === 0) {
      return null;
    }

    const lastPayment = sortedPayments[sortedPayments.length - 1];
    const paymentsBeforeLast = sortedPayments.slice(0, -1);

    // Calculate balance before the last payment
    const beforeLastResult = processAllPayments(loan, paymentsBeforeLast);
    const balanceBeforePayment = beforeLastResult.finalBalance;

    // Calculate the last payment result
    const normalizedLoan = normalizeLoanDates(loan);
    const lastPaymentDate =
      paymentsBeforeLast.length > 0
        ? new Date(
            paymentsBeforeLast[paymentsBeforeLast.length - 1].paymentDate
          )
        : normalizedLoan.interestStartDate;

    const lastPaymentResult = applyPaymentToBalance(
      balanceBeforePayment,
      lastPayment,
      normalizedLoan,
      lastPaymentDate
    );

    return {
      lastPayment,
      balanceBefore: balanceBeforePayment,
      balanceAfter: lastPaymentResult.newBalance,
      currentBalance: lastPaymentResult.newBalance,
      interestPaid: lastPaymentResult.interestPaid,
      principalPaid: lastPaymentResult.principalPaid,
    };
  }, [loan, relevantPayments, sortedPayments]);

  return {
    monthlyRate,
    disbursementDate,
    interestStartDate,
    firstPaymentDueDate,
    monthlyPaymentAmount,
    getPaymentsForMonth,
    getFirstPaymentDueDatePayments,
    actualLoanStats,
    additionalSpentOverMinimum,
    lastPaymentBreakdown,
  };
};
