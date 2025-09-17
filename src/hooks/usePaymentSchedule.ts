import { useMemo, useRef, useEffect } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';
import {
  normalizeLoanDates,
  calculateInterestBetweenDates,
  calculateEffectiveStartingBalance,
  applyPaymentToBalance,
} from '../utils/consolidatedCalculations';
import {
  createStableArray,
  createCleanupFunction,
  limitArraySize,
} from '../utils/memoryUtils';

export const usePaymentSchedule = (
  loan: Loan,
  loanPayments: Payment[],
  adjustedMonthlyPayment?: number
) => {
  const {
    monthlyRate,
    interestStartDate,
    firstPaymentDueDate,
    monthlyPaymentAmount,
  } = useLoanCalculations(loan, loanPayments);

  // Use adjusted payment amount if provided, otherwise use calculated amount
  const effectiveMonthlyPayment =
    adjustedMonthlyPayment ?? monthlyPaymentAmount;

  // Create cleanup function for this hook
  const cleanup = useRef(createCleanupFunction());

  // Cleanup on unmount
  useEffect(() => {
    const cleanupFn = cleanup.current;
    return () => {
      cleanupFn.cleanup();
    };
  }, []);

  // Memoize sorted payments to prevent unnecessary sorting on every render
  const sortedPayments = useMemo(() => {
    const limitedPayments = limitArraySize(loanPayments, 1000); // Limit to 1000 payments
    return [...createStableArray(limitedPayments)].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );
  }, [loanPayments]);

  // Memoize max months calculation
  const maxMonths = useMemo(() => {
    return loan.termMonths > 0 ? loan.termMonths : 120; // Cap at 10 years for minimum payment loans
  }, [loan.termMonths]);

  // Memoize effective starting balance
  const effectiveStartingBalance = useMemo(() => {
    return calculateEffectiveStartingBalance(loan);
  }, [loan]);

  const paymentScheduleData = useMemo(() => {
    const data = [];
    // Use payments start date as the baseline - balance starts at principal when payments begin
    let actualBalance = effectiveStartingBalance;
    let minimumPaymentBalance = effectiveStartingBalance; // Track balance if only minimum payments were made

    // Add iteration limit to prevent infinite loops
    const maxIterations = Math.min(maxMonths, 600); // Cap at 50 years maximum

    for (let month = 0; month <= maxIterations; month++) {
      if (month === 0) {
        // For month 0, check if there are any payments on or before the first payment due date
        const firstDueDatePayments = sortedPayments.filter(
          (payment: Payment) => {
            const paymentDate = new Date(payment.paymentDate);
            const firstDue = new Date(firstPaymentDueDate);
            return payment.loanId === loan.id && paymentDate <= firstDue;
          }
        );

        let initialBalance = effectiveStartingBalance;
        let totalPaymentsThisMonth = 0;
        let totalInterestThisMonth = 0;

        if (firstDueDatePayments.length > 0) {
          // Process all payments made on or before the first payment due date
          totalPaymentsThisMonth = firstDueDatePayments.reduce(
            (sum: number, payment: Payment) => sum + payment.amount,
            0
          );

          // Calculate interest from interestStartDate to each payment date
          let totalInterestForPayments = 0;
          let runningBalance = initialBalance;
          let lastInterestDate = interestStartDate;

          // Process payments in chronological order to calculate interest properly
          const sortedFirstDueDatePayments = [...firstDueDatePayments].sort(
            (a, b) =>
              new Date(a.paymentDate).getTime() -
              new Date(b.paymentDate).getTime()
          );

          for (const payment of sortedFirstDueDatePayments) {
            const paymentDate = new Date(payment.paymentDate);

            // Calculate interest from last date to this payment date
            const interestOwed = calculateInterestBetweenDates(
              runningBalance,
              loan.interestRate,
              lastInterestDate,
              paymentDate,
              loan.interestAccrualMethod
            );

            totalInterestForPayments += interestOwed;

            // Apply payment: interest first, then principal
            const interestPaid = Math.min(payment.amount, interestOwed);
            const principalPaid = Math.max(0, payment.amount - interestPaid);

            runningBalance = Math.max(0, runningBalance - principalPaid);
            lastInterestDate = paymentDate;
          }

          totalInterestThisMonth = totalInterestForPayments;
          initialBalance = runningBalance;
        } else if (effectiveMonthlyPayment > 0) {
          // If no actual payments on or before first due date, apply scheduled payment
          // Calculate interest from interestStartDate to firstPaymentDueDate
          const interestOwed = calculateInterestBetweenDates(
            initialBalance,
            loan.interestRate,
            interestStartDate,
            firstPaymentDueDate,
            loan.interestAccrualMethod
          );

          totalInterestThisMonth = interestOwed;

          // Apply payment: interest first, then principal
          const interestPaid = Math.min(effectiveMonthlyPayment, interestOwed);
          const principalPaid = Math.max(
            0,
            effectiveMonthlyPayment - interestPaid
          );
          initialBalance = Math.max(0, initialBalance - principalPaid);
        }

        // Calculate actual month and year for this data point
        const actualDate = new Date(
          firstPaymentDueDate.getFullYear(),
          firstPaymentDueDate.getMonth() + month,
          1
        );
        const monthName = actualDate.toLocaleDateString('en-US', {
          month: 'long',
        });
        const year = actualDate.getFullYear();

        // Calculate minimum payment balance for month 0 (always uses scheduled payment)
        let minimumPaymentBalanceMonth0 = effectiveStartingBalance;
        if (effectiveMonthlyPayment > 0) {
          // Calculate interest from interestStartDate to firstPaymentDueDate
          const interestOwed = calculateInterestBetweenDates(
            minimumPaymentBalanceMonth0,
            loan.interestRate,
            interestStartDate,
            firstPaymentDueDate,
            loan.interestAccrualMethod
          );

          const principalPayment = Math.max(
            0,
            effectiveMonthlyPayment - interestOwed
          );
          minimumPaymentBalanceMonth0 = Math.max(
            0,
            minimumPaymentBalanceMonth0 - principalPayment
          );
        }

        // If no actual payments and no scheduled payment, both lines should be the same
        if (totalPaymentsThisMonth === 0 && effectiveMonthlyPayment === 0) {
          initialBalance = minimumPaymentBalanceMonth0;
        }

        data.push({
          month,
          balance: initialBalance,
          minimumPaymentBalance: minimumPaymentBalanceMonth0,
          startingBalance: effectiveStartingBalance,
          totalPayments: totalPaymentsThisMonth,
          scheduledPayment: effectiveMonthlyPayment,
          paymentUsed:
            totalPaymentsThisMonth > 0
              ? totalPaymentsThisMonth
              : effectiveMonthlyPayment > 0
                ? effectiveMonthlyPayment
                : 0,
          totalInterest: totalInterestThisMonth,
          monthName,
          year,
          actualDate: actualDate.toISOString(),
        });
        actualBalance = initialBalance;
        minimumPaymentBalance = minimumPaymentBalanceMonth0;
        continue;
      }

      // Get actual payments for this month
      const monthStart = new Date(
        firstPaymentDueDate.getFullYear(),
        firstPaymentDueDate.getMonth() + month,
        1
      );
      const monthEnd = new Date(
        firstPaymentDueDate.getFullYear(),
        firstPaymentDueDate.getMonth() + month + 1,
        0
      );

      const monthPayments = sortedPayments.filter((payment: Payment) => {
        const paymentDate = new Date(payment.paymentDate);
        return (
          payment.loanId === loan.id &&
          paymentDate >= monthStart &&
          paymentDate <= monthEnd
        );
      });

      const actualPayment =
        monthPayments.length > 0
          ? monthPayments.reduce(
              (sum: number, payment: Payment) => sum + payment.amount,
              0
            )
          : null;

      // Store starting balance for this month
      const startingBalance = actualBalance;

      // Calculate balance for this month
      let paymentToUse = 0;
      let totalInterestThisMonth = 0;

      if (actualPayment && actualPayment > 0) {
        // Use actual payment amount
        paymentToUse = actualPayment;
      } else if (effectiveMonthlyPayment > 0) {
        // Use scheduled payment amount (minimum or monthly)
        paymentToUse = effectiveMonthlyPayment;
      }

      // Calculate actual balance (with actual payments or scheduled payments)
      if (paymentToUse > 0) {
        const interestOwed = calculateInterestBetweenDates(
          actualBalance,
          loan.interestRate,
          monthStart,
          monthEnd,
          loan.interestAccrualMethod
        );
        totalInterestThisMonth = Math.min(interestOwed, paymentToUse);
        const principalPayment = Math.max(0, paymentToUse - interestOwed);
        actualBalance = Math.max(0, actualBalance - principalPayment);
      }

      // Calculate minimum payment balance for this month (always uses minimum payment)
      if (effectiveMonthlyPayment > 0) {
        const interestOwed = calculateInterestBetweenDates(
          minimumPaymentBalance,
          loan.interestRate,
          monthStart,
          monthEnd,
          loan.interestAccrualMethod
        );
        const principalPayment = Math.max(
          0,
          effectiveMonthlyPayment - interestOwed
        );
        minimumPaymentBalance = Math.max(
          0,
          minimumPaymentBalance - principalPayment
        );
      }

      // Calculate actual month and year for this data point
      const actualDate = new Date(
        firstPaymentDueDate.getFullYear(),
        firstPaymentDueDate.getMonth() + month,
        1
      );
      const monthName = actualDate.toLocaleDateString('en-US', {
        month: 'long',
      });
      const year = actualDate.getFullYear();

      data.push({
        month,
        balance: actualBalance,
        minimumPaymentBalance: minimumPaymentBalance,
        startingBalance: startingBalance,
        totalPayments: actualPayment || 0,
        scheduledPayment: effectiveMonthlyPayment,
        paymentUsed: paymentToUse,
        totalInterest: totalInterestThisMonth,
        monthName,
        year,
        actualDate: actualDate.toISOString(),
      });

      if (actualBalance <= 0) break;
    }

    // Limit the data array size to prevent memory bloat
    return limitArraySize(data, 600); // Limit to 600 months (50 years)
  }, [
    loan,
    sortedPayments,
    maxMonths,
    effectiveStartingBalance,
    monthlyRate,
    effectiveMonthlyPayment,
    interestStartDate,
    firstPaymentDueDate,
  ]);

  return paymentScheduleData;
};
