import { useState, useCallback, useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';
import { safeCalculate } from '../utils/errorHandling';
import { useCleanup } from './useCleanup';

interface MonthlyPaymentAdjustment {
  readonly loanId: string;
  readonly adjustedAmount: number;
  readonly isAdjusted: boolean;
  readonly originalAmount: number;
  readonly adjustmentReason?: string;
  readonly adjustedAt: Date;
}

interface UseMonthlyPaymentAdjustmentProps {
  loan: Loan;
  loanPayments: Payment[];
}

interface UseMonthlyPaymentAdjustmentReturn {
  // Current payment amount (adjusted or original)
  currentMonthlyPayment: number;

  // Original calculated payment amount
  originalMonthlyPayment: number;

  // Whether the payment has been adjusted
  isAdjusted: boolean;

  // Adjustment details
  adjustment: MonthlyPaymentAdjustment | null;

  // Actions
  adjustPayment: (newAmount: number, reason?: string) => void;
  resetToOriginal: () => void;
  updateAdjustment: (newAmount: number, reason?: string) => void;

  // Validation
  isValidAdjustment: (amount: number) => boolean;
  getValidationMessage: (amount: number) => string;

  // Statistics
  getAdjustmentImpact: () => {
    monthlyDifference: number;
    totalDifference: number;
    timeSavedMonths: number;
    interestSaved: number;
  };
}

export const useMonthlyPaymentAdjustment = ({
  loan,
  loanPayments = [],
}: UseMonthlyPaymentAdjustmentProps): UseMonthlyPaymentAdjustmentReturn => {
  // Use shared cleanup hook
  useCleanup();

  // Get original monthly payment calculation
  const { monthlyPaymentAmount } = useLoanCalculations(loan, loanPayments);

  // State for current adjustment
  const [adjustment, setAdjustment] = useState<MonthlyPaymentAdjustment | null>(
    null
  );

  // Memoize original payment amount
  const originalMonthlyPayment = useMemo(() => {
    return monthlyPaymentAmount;
  }, [monthlyPaymentAmount]);

  // Current payment amount (adjusted or original)
  const currentMonthlyPayment = useMemo(() => {
    return adjustment?.adjustedAmount ?? originalMonthlyPayment;
  }, [adjustment, originalMonthlyPayment]);

  // Whether payment is currently adjusted
  const isAdjusted = useMemo(() => {
    return adjustment !== null;
  }, [adjustment]);

  // Validate adjustment amount
  const isValidAdjustment = useCallback((amount: number): boolean => {
    if (amount <= 0) return false;
    return true;
  }, []);

  // Get validation message for amount
  const getValidationMessage = useCallback((amount: number): string => {
    if (amount <= 0) return 'Payment amount must be greater than zero';
    return '';
  }, []);

  // Adjust payment amount
  const adjustPayment = useCallback(
    (newAmount: number, reason?: string) => {
      if (!isValidAdjustment(newAmount)) {
        throw new Error(getValidationMessage(newAmount));
      }

      const newAdjustment: MonthlyPaymentAdjustment = {
        loanId: loan.id,
        adjustedAmount: newAmount,
        isAdjusted: true,
        originalAmount: originalMonthlyPayment,
        adjustmentReason: reason,
        adjustedAt: new Date(),
      };

      setAdjustment(newAdjustment);
    },
    [loan.id, originalMonthlyPayment, isValidAdjustment, getValidationMessage]
  );

  // Update existing adjustment
  const updateAdjustment = useCallback(
    (newAmount: number, reason?: string) => {
      if (!adjustment) {
        adjustPayment(newAmount, reason);
        return;
      }

      if (!isValidAdjustment(newAmount)) {
        throw new Error(getValidationMessage(newAmount));
      }

      const updatedAdjustment: MonthlyPaymentAdjustment = {
        ...adjustment,
        adjustedAmount: newAmount,
        adjustmentReason: reason,
        adjustedAt: new Date(),
      };

      setAdjustment(updatedAdjustment);
    },
    [adjustment, adjustPayment, isValidAdjustment, getValidationMessage]
  );

  // Reset to original payment
  const resetToOriginal = useCallback(() => {
    setAdjustment(null);
  }, []);

  // Calculate adjustment impact
  const getAdjustmentImpact = useCallback(() => {
    if (!adjustment) {
      return {
        monthlyDifference: 0,
        totalDifference: 0,
        timeSavedMonths: 0,
        interestSaved: 0,
      };
    }

    const monthlyDifference =
      adjustment.adjustedAmount - adjustment.originalAmount;

    // Calculate projected impact using loan calculations
    const monthlyRate = loan.interestRate / 100 / 12;
    const remainingBalance = safeCalculate(
      () => {
        // Calculate current balance after existing payments
        let balance = loan.principal;
        for (const payment of loanPayments) {
          if (payment.loanId === loan.id) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.max(
              0,
              payment.amount - interestPayment
            );
            balance = Math.max(0, balance - principalPayment);
          }
        }
        return balance;
      },
      loan.principal,
      'Failed to calculate remaining balance'
    );

    // Calculate payoff time and total interest with original payment
    const originalPayoff = safeCalculate(
      () => {
        if (adjustment.originalAmount <= 0)
          return { months: 0, totalInterest: 0 };
        let balance = remainingBalance;
        let totalInterest = 0;
        let months = 0;
        const maxMonths = 600; // Cap at 50 years

        while (balance > 0.01 && months < maxMonths) {
          const interestPayment = balance * monthlyRate;
          const principalPayment = Math.max(
            0,
            adjustment.originalAmount - interestPayment
          );
          totalInterest += interestPayment;
          balance = Math.max(0, balance - principalPayment);
          months++;
        }
        return { months, totalInterest };
      },
      { months: 0, totalInterest: 0 },
      'Failed to calculate original payoff time'
    );

    // Calculate payoff time and total interest with adjusted payment
    const adjustedPayoff = safeCalculate(
      () => {
        if (adjustment.adjustedAmount <= 0)
          return { months: 0, totalInterest: 0 };
        let balance = remainingBalance;
        let totalInterest = 0;
        let months = 0;
        const maxMonths = 600; // Cap at 50 years

        while (balance > 0.01 && months < maxMonths) {
          const interestPayment = balance * monthlyRate;
          const principalPayment = Math.max(
            0,
            adjustment.adjustedAmount - interestPayment
          );
          totalInterest += interestPayment;
          balance = Math.max(0, balance - principalPayment);
          months++;
        }
        return { months, totalInterest };
      },
      { months: 0, totalInterest: 0 },
      'Failed to calculate adjusted payoff time'
    );

    const timeSavedMonths = Math.max(
      0,
      originalPayoff.months - adjustedPayoff.months
    );

    // Calculate total payments with original amount
    const originalTotalPayments =
      originalPayoff.months * adjustment.originalAmount;

    // Calculate total payments with adjusted amount
    const adjustedTotalPayments =
      adjustedPayoff.months * adjustment.adjustedAmount;

    const totalDifference = originalTotalPayments - adjustedTotalPayments;

    // Interest saved is the difference in total interest paid
    const interestSaved = Math.max(
      0,
      originalPayoff.totalInterest - adjustedPayoff.totalInterest
    );

    return {
      monthlyDifference,
      totalDifference,
      timeSavedMonths,
      interestSaved,
    };
  }, [adjustment, loan, loanPayments]);

  return {
    currentMonthlyPayment,
    originalMonthlyPayment,
    isAdjusted,
    adjustment,
    adjustPayment,
    resetToOriginal,
    updateAdjustment,
    isValidAdjustment,
    getValidationMessage,
    getAdjustmentImpact,
  };
};
