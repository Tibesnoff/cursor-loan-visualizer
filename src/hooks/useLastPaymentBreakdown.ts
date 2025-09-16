import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';

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

    let balanceBeforePayment = loan.principal;

    // Calculate balance up to the last payment
    paymentsBeforeLast.forEach(payment => {
      const interestOwed = balanceBeforePayment * monthlyRate;
      const principalPayment = Math.max(0, payment.amount - interestOwed);
      balanceBeforePayment = Math.max(
        0,
        balanceBeforePayment - principalPayment
      );
    });

    // Calculate breakdown for the last payment
    const interestOwed = balanceBeforePayment * monthlyRate;
    const principalPayment = Math.max(0, lastPayment.amount - interestOwed);
    const balanceAfterPayment = Math.max(
      0,
      balanceBeforePayment - principalPayment
    );

    return {
      lastPayment,
      balanceBefore: balanceBeforePayment,
      balanceAfter: balanceAfterPayment,
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
