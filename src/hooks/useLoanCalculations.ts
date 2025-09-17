import { useMemo, useRef, useEffect } from 'react';
import { Loan, Payment } from '../types';
import { calculateInterestBetweenDates } from '../utils/interestCalculations';
import {
  calculateEffectiveStartingBalance,
  applyPaymentToBalance,
  calculateMonthlyPayment,
} from '../utils/loanCalculationUtils';
import {
  createError,
  ErrorType,
  safeCalculate,
  logError,
} from '../utils/errorHandling';
import {
  createStableArray,
  createCleanupFunction,
  limitArraySize,
} from '../utils/memoryUtils';

export const useLoanCalculations = (loan: Loan, loanPayments: Payment[]) => {
  // Create cleanup function for this hook
  const cleanup = useRef(createCleanupFunction());

  // Cleanup on unmount
  useEffect(() => {
    const cleanupFn = cleanup.current;
    return () => {
      cleanupFn.cleanup();
    };
  }, []);

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

  const loanStartDate = safeCalculate(
    () => new Date(loan.startDate),
    new Date(),
    'Failed to parse loan start date',
    'useLoanCalculations'
  );

  const paymentsStartDate = safeCalculate(
    () =>
      loan.paymentsStartDate ? new Date(loan.paymentsStartDate) : loanStartDate,
    loanStartDate,
    'Failed to parse payments start date',
    'useLoanCalculations'
  );

  // Calculate monthly payment amount
  const monthlyPaymentAmount = useMemo(() => {
    return calculateMonthlyPayment(loan);
  }, [loan]);

  // Get payments for a specific month
  const getPaymentsForMonth = (monthIndex: number) => {
    const monthStart = new Date(
      paymentsStartDate.getFullYear(),
      paymentsStartDate.getMonth() + monthIndex,
      1
    );
    const monthEnd = new Date(
      paymentsStartDate.getFullYear(),
      paymentsStartDate.getMonth() + monthIndex + 1,
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

  // Get payments for the payments start date
  const getStartDatePayments = () => {
    return loanPayments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const paymentsStart = new Date(paymentsStartDate);
      return (
        payment.loanId === loan.id &&
        paymentDate.getFullYear() === paymentsStart.getFullYear() &&
        paymentDate.getMonth() === paymentsStart.getMonth() &&
        paymentDate.getDate() === paymentsStart.getDate()
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

  // Calculate actual loan statistics with optimized dependencies
  const actualLoanStats = useMemo(() => {
    const totalPaid = relevantPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    let balance = calculateEffectiveStartingBalance(loan);
    let interestPaid = 0;
    let principalPaid = 0;

    let lastPaymentDate = paymentsStartDate;

    // Process payments in chronological order
    for (const payment of sortedPayments) {
      const paymentResult = applyPaymentToBalance(
        balance,
        payment,
        loan.interestRate,
        loan.interestAccrualMethod,
        lastPaymentDate
      );

      balance = paymentResult.newBalance;
      interestPaid += paymentResult.interestPaid;
      principalPaid += paymentResult.principalPaid;
      lastPaymentDate = new Date(payment.paymentDate);
    }

    // Calculate interest accrued since the last payment up to today
    const currentDate = new Date();
    if (sortedPayments.length > 0) {
      const interestSinceLastPayment = calculateInterestBetweenDates(
        balance,
        loan.interestRate,
        lastPaymentDate,
        currentDate,
        loan.interestAccrualMethod
      );
      balance += interestSinceLastPayment;
    }

    return {
      totalPaid,
      principalPaid,
      interestPaid,
      remainingBalance: balance,
    };
  }, [loan, sortedPayments, paymentsStartDate, relevantPayments]);

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
      (currentDate.getFullYear() - paymentsStartDate.getFullYear()) * 12 +
        (currentDate.getMonth() - paymentsStartDate.getMonth()) +
        1
    );

    const minimumAmount = monthlyPaymentAmount;
    const expectedMinimum = minimumAmount * monthsSinceStart;

    return Math.max(0, totalPaid - expectedMinimum);
  }, [loanPayments, loan.id, monthlyPaymentAmount, paymentsStartDate]);

  // Calculate last payment breakdown
  const lastPaymentBreakdown = useMemo(() => {
    const relevantPayments = loanPayments.filter(
      payment => payment.loanId === loan.id
    );

    if (relevantPayments.length === 0) {
      return null;
    }

    const sortedPayments = [...relevantPayments].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    const lastPayment = sortedPayments[sortedPayments.length - 1];
    const paymentsBeforeLast = sortedPayments.slice(0, -1);

    let balanceBeforePayment = calculateEffectiveStartingBalance(loan);
    let lastPaymentDate = paymentsStartDate;

    paymentsBeforeLast.forEach(payment => {
      const paymentResult = applyPaymentToBalance(
        balanceBeforePayment,
        payment,
        loan.interestRate,
        loan.interestAccrualMethod,
        lastPaymentDate
      );

      balanceBeforePayment = paymentResult.newBalance;
      lastPaymentDate = new Date(payment.paymentDate);
    });

    const paymentDate = new Date(lastPayment.paymentDate);
    const lastPaymentResult = applyPaymentToBalance(
      balanceBeforePayment,
      lastPayment,
      loan.interestRate,
      loan.interestAccrualMethod,
      lastPaymentDate
    );

    const interestPaid = lastPaymentResult.interestPaid;
    const principalPaid = lastPaymentResult.principalPaid;
    const balanceAfterPayment = lastPaymentResult.newBalance;

    // Calculate interest accrued since the last payment up to today
    const currentDate = new Date();
    const interestSinceLastPayment = calculateInterestBetweenDates(
      balanceAfterPayment,
      loan.interestRate,
      paymentDate,
      currentDate,
      loan.interestAccrualMethod
    );

    const currentBalance = balanceAfterPayment + interestSinceLastPayment;

    return {
      lastPayment,
      balanceBefore: balanceBeforePayment,
      balanceAfter: balanceAfterPayment,
      currentBalance: currentBalance,
      interestPaid: interestPaid,
      principalPaid: principalPaid,
    };
  }, [loan, loanPayments, paymentsStartDate]);

  return {
    monthlyRate,
    loanStartDate,
    paymentsStartDate,
    monthlyPaymentAmount,
    getPaymentsForMonth,
    getStartDatePayments,
    actualLoanStats,
    additionalSpentOverMinimum,
    lastPaymentBreakdown,
  };
};
