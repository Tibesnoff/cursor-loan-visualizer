import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';
import { calculateInterestBetweenDates } from '../utils/interestCalculations';
import {
  calculateEffectiveStartingBalance,
  applyPaymentToBalance,
} from '../utils/loanCalculationUtils';

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

    // Use the new loan calculation utility to get the effective starting balance
    // This will be the principal amount when payments begin
    let balanceBeforePayment = calculateEffectiveStartingBalance(loan);
    let lastPaymentDate = loan.paymentsStartDate
      ? new Date(loan.paymentsStartDate)
      : new Date(loan.startDate);

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

    // Calculate breakdown for the last payment using the new utility
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
    let balanceAfterPayment = lastPaymentResult.newBalance;

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
      interestPaid: interestPaid,
      principalPaid: principalPaid,
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
