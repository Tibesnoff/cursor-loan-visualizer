import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';
import { calculateInterestBetweenDates } from '../utils/interestCalculations';
import { calculateEffectiveStartingBalance } from '../utils/loanCalculationUtils';

export const usePaymentSchedule = (loan: Loan, loanPayments: Payment[]) => {
  const {
    monthlyRate,
    loanStartDate,
    paymentsStartDate,
    monthlyPaymentAmount,
  } = useLoanCalculations(loan, loanPayments);

  const paymentScheduleData = useMemo(() => {
    const data = [];
    // Use payments start date as the baseline - balance starts at principal when payments begin
    let actualBalance = calculateEffectiveStartingBalance(loan);
    let minimumPaymentBalance = calculateEffectiveStartingBalance(loan); // Track balance if only minimum payments were made
    const maxMonths = loan.termMonths > 0 ? loan.termMonths : 120; // Cap at 10 years for minimum payment loans

    // Sort payments by date for chronological processing
    const sortedPayments = [...loanPayments].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    for (let month = 0; month <= maxMonths; month++) {
      if (month === 0) {
        // For month 0, check if there are any payments on or before the payments start date
        const startDatePayments = sortedPayments.filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          const paymentsStart = new Date(paymentsStartDate);
          return payment.loanId === loan.id && paymentDate <= paymentsStart;
        });

        let initialBalance = calculateEffectiveStartingBalance(loan);
        let totalPaymentsThisMonth = 0;
        let totalInterestThisMonth = 0;

        if (startDatePayments.length > 0) {
          // Process all payments made on or before the payments start date
          totalPaymentsThisMonth = startDatePayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
          );

          // No interest calculation needed - payments start date is the baseline
          // All payments go to principal since no interest has accrued yet
          const principalPayment = totalPaymentsThisMonth;
          initialBalance = Math.max(0, initialBalance - principalPayment);
          totalInterestThisMonth = 0; // No interest accrued before payments start
        } else if (monthlyPaymentAmount > 0) {
          // If no actual payments on or before start date, apply scheduled payment
          // No interest calculation needed - payments start date is the baseline
          totalInterestThisMonth = 0; // No interest accrued before payments start
          const principalPayment = monthlyPaymentAmount;
          initialBalance = Math.max(0, initialBalance - principalPayment);
        }

        // Calculate actual month and year for this data point
        const actualDate = new Date(
          paymentsStartDate.getFullYear(),
          paymentsStartDate.getMonth() + month,
          1
        );
        const monthName = actualDate.toLocaleDateString('en-US', {
          month: 'long',
        });
        const year = actualDate.getFullYear();

        // Calculate minimum payment balance for month 0 (always uses scheduled payment)
        let minimumPaymentBalanceMonth0 = loan.principal;
        if (monthlyPaymentAmount > 0) {
          const interestOwed = minimumPaymentBalanceMonth0 * monthlyRate;
          const principalPayment = Math.max(
            0,
            monthlyPaymentAmount - interestOwed
          );
          minimumPaymentBalanceMonth0 = Math.max(
            0,
            minimumPaymentBalanceMonth0 - principalPayment
          );
        }

        // If no actual payments and no scheduled payment, both lines should be the same
        if (totalPaymentsThisMonth === 0 && monthlyPaymentAmount === 0) {
          initialBalance = minimumPaymentBalanceMonth0;
        }

        data.push({
          month,
          balance: initialBalance,
          minimumPaymentBalance: minimumPaymentBalanceMonth0,
          startingBalance: loan.principal,
          totalPayments: totalPaymentsThisMonth,
          scheduledPayment: monthlyPaymentAmount,
          paymentUsed:
            totalPaymentsThisMonth > 0
              ? totalPaymentsThisMonth
              : monthlyPaymentAmount > 0
                ? monthlyPaymentAmount
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
        paymentsStartDate.getFullYear(),
        paymentsStartDate.getMonth() + month,
        1
      );
      const monthEnd = new Date(
        paymentsStartDate.getFullYear(),
        paymentsStartDate.getMonth() + month + 1,
        0
      );

      const monthPayments = sortedPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return (
          payment.loanId === loan.id &&
          paymentDate >= monthStart &&
          paymentDate <= monthEnd
        );
      });

      const actualPayment =
        monthPayments.length > 0
          ? monthPayments.reduce((sum, payment) => sum + payment.amount, 0)
          : null;

      // Store starting balance for this month
      const startingBalance = actualBalance;

      // Calculate balance for this month
      let paymentToUse = 0;
      let totalInterestThisMonth = 0;

      if (actualPayment && actualPayment > 0) {
        // Use actual payment amount
        paymentToUse = actualPayment;
      } else if (monthlyPaymentAmount > 0) {
        // Use scheduled payment amount (minimum or monthly)
        paymentToUse = monthlyPaymentAmount;
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
      if (monthlyPaymentAmount > 0) {
        const interestOwed = calculateInterestBetweenDates(
          minimumPaymentBalance,
          loan.interestRate,
          monthStart,
          monthEnd,
          loan.interestAccrualMethod
        );
        const principalPayment = Math.max(
          0,
          monthlyPaymentAmount - interestOwed
        );
        minimumPaymentBalance = Math.max(
          0,
          minimumPaymentBalance - principalPayment
        );
      }

      // Calculate actual month and year for this data point
      const actualDate = new Date(
        paymentsStartDate.getFullYear(),
        paymentsStartDate.getMonth() + month,
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
        scheduledPayment: monthlyPaymentAmount,
        paymentUsed: paymentToUse,
        totalInterest: totalInterestThisMonth,
        monthName,
        year,
        actualDate: actualDate.toISOString(),
      });

      if (actualBalance <= 0) break;
    }

    return data;
  }, [
    loan,
    loanPayments,
    monthlyRate,
    monthlyPaymentAmount,
    loanStartDate,
    paymentsStartDate,
  ]);

  return paymentScheduleData;
};
