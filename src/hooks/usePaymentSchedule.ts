import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';

export const usePaymentSchedule = (loan: Loan, loanPayments: Payment[]) => {
  const {
    monthlyRate,
    loanStartDate,
    monthlyPaymentAmount,
    getPaymentsForMonth,
    getStartDatePayments,
  } = useLoanCalculations(loan, loanPayments);

  const paymentScheduleData = useMemo(() => {
    const data = [];
    let actualBalance = loan.principal;
    const maxMonths = loan.termMonths > 0 ? loan.termMonths : 120; // Cap at 10 years for minimum payment loans

    // Sort payments by date for chronological processing
    const sortedPayments = [...loanPayments].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    for (let month = 0; month <= maxMonths; month++) {
      if (month === 0) {
        // For month 0, check if there are any payments on the start date
        const startDatePayments = sortedPayments.filter(payment => {
          const paymentDate = new Date(payment.paymentDate);
          const loanStart = new Date(loanStartDate);
          return (
            payment.loanId === loan.id &&
            paymentDate.getFullYear() === loanStart.getFullYear() &&
            paymentDate.getMonth() === loanStart.getMonth() &&
            paymentDate.getDate() === loanStart.getDate()
          );
        });

        let initialBalance = loan.principal;
        let totalPaymentsThisMonth = 0;
        let totalInterestThisMonth = 0;

        if (startDatePayments.length > 0) {
          totalPaymentsThisMonth = startDatePayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
          );
          const interestOwed = initialBalance * monthlyRate;
          totalInterestThisMonth = Math.min(
            interestOwed,
            totalPaymentsThisMonth
          );
          const principalPayment = Math.max(
            0,
            totalPaymentsThisMonth - interestOwed
          );
          initialBalance = Math.max(0, initialBalance - principalPayment);
        }

        data.push({
          month,
          balance: initialBalance,
          startingBalance: loan.principal,
          totalPayments: totalPaymentsThisMonth,
          scheduledPayment: monthlyPaymentAmount,
          paymentUsed: totalPaymentsThisMonth,
          totalInterest: totalInterestThisMonth,
        });
        actualBalance = initialBalance;
        continue;
      }

      // Get actual payments for this month
      const monthStart = new Date(
        loanStartDate.getFullYear(),
        loanStartDate.getMonth() + month,
        1
      );
      const monthEnd = new Date(
        loanStartDate.getFullYear(),
        loanStartDate.getMonth() + month + 1,
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

      if (paymentToUse > 0) {
        const interestOwed = actualBalance * monthlyRate;
        totalInterestThisMonth = Math.min(interestOwed, paymentToUse);
        const principalPayment = Math.max(0, paymentToUse - interestOwed);
        actualBalance = Math.max(0, actualBalance - principalPayment);
      }

      data.push({
        month,
        balance: actualBalance,
        startingBalance: startingBalance,
        totalPayments: actualPayment || 0,
        scheduledPayment: monthlyPaymentAmount,
        paymentUsed: paymentToUse,
        totalInterest: totalInterestThisMonth,
      });

      if (actualBalance <= 0) break;
    }

    return data;
  }, [loan, loanPayments, monthlyRate, monthlyPaymentAmount, loanStartDate]);

  return paymentScheduleData;
};
