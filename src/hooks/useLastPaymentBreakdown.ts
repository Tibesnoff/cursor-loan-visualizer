import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';
import { calculateInterestBetweenDates } from '../utils/interestCalculations';

interface UseLastPaymentBreakdownProps {
  loan: Loan;
  loanPayments: Payment[];
}

export const useLastPaymentBreakdown = ({
  loan,
  loanPayments,
}: UseLastPaymentBreakdownProps) => {
  const { monthlyRate, getPaymentsForMonth, getStartDatePayments } =
    useLoanCalculations(loan, loanPayments);

  const lastPaymentBreakdown = useMemo(() => {
    if (loanPayments.length === 0) return null;

    // Get the most recent payment
    const lastPayment = loanPayments.sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )[0];

    if (!lastPayment) return null;

    // Calculate what the balance was before this payment
    const paymentsBeforeLast = loanPayments
      .filter(
        p =>
          p.loanId === loan.id &&
          new Date(p.paymentDate).getTime() <
            new Date(lastPayment.paymentDate).getTime()
      )
      .sort(
        (a, b) =>
          new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
      );

    // For student loans, the balance typically starts at principal when payments begin
    // Only add interest if there's a short gap (like a few months) between loan start and payments start
    let balanceBeforePayment = loan.principal;
    let lastPaymentDate = loan.paymentsStartDate
      ? new Date(loan.paymentsStartDate)
      : new Date(loan.startDate);

    // Only add interest if the gap is reasonable (less than 1 year)
    if (loan.paymentsStartDate) {
      const loanStartDate = new Date(loan.startDate);
      const paymentsStartDate = new Date(loan.paymentsStartDate);
      const daysDifference =
        Math.abs(paymentsStartDate.getTime() - loanStartDate.getTime()) /
        (1000 * 60 * 60 * 24);

      // Only add interest if the gap is less than 365 days
      if (daysDifference < 365) {
        const interestBeforePaymentsStart = calculateInterestBetweenDates(
          balanceBeforePayment,
          loan.interestRate,
          loanStartDate,
          paymentsStartDate,
          loan.interestAccrualMethod
        );
        balanceBeforePayment += interestBeforePaymentsStart;
      }
    }

    paymentsBeforeLast.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate);

      // Calculate interest accrued over this period using the selected method
      const interestOwed = calculateInterestBetweenDates(
        balanceBeforePayment,
        loan.interestRate,
        lastPaymentDate,
        paymentDate,
        loan.interestAccrualMethod
      );

      const principalPayment = Math.max(0, payment.amount - interestOwed);
      balanceBeforePayment = Math.max(
        0,
        balanceBeforePayment - principalPayment
      );

      lastPaymentDate = paymentDate;
    });

    // Calculate breakdown for the last payment using the selected interest accrual method
    const paymentDate = new Date(lastPayment.paymentDate);
    const interestOwed = calculateInterestBetweenDates(
      balanceBeforePayment,
      loan.interestRate,
      lastPaymentDate,
      paymentDate,
      loan.interestAccrualMethod
    );
    const principalPayment = Math.max(0, lastPayment.amount - interestOwed);
    let balanceAfterPayment = Math.max(
      0,
      balanceBeforePayment - principalPayment
    );

    // Calculate interest accrued since the last payment up to today
    const currentDate = new Date();
    const interestSinceLastPayment = calculateInterestBetweenDates(
      balanceAfterPayment,
      loan.interestRate,
      paymentDate,
      currentDate,
      loan.interestAccrualMethod
    );

    // Add the interest accrued since last payment to get current balance
    const currentBalance = balanceAfterPayment + interestSinceLastPayment;

    return {
      lastPayment,
      balanceBefore: balanceBeforePayment,
      balanceAfter: balanceAfterPayment,
      currentBalance: currentBalance,
      interestPaid: Math.min(interestOwed, lastPayment.amount),
      principalPaid: principalPayment,
    };
  }, [
    loan,
    loanPayments,
    monthlyRate,
    getPaymentsForMonth,
    getStartDatePayments,
  ]);

  return lastPaymentBreakdown;
};
