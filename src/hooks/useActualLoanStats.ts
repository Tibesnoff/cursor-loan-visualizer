import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';

export const useActualLoanStats = (loan: Loan, loanPayments: Payment[]) => {
  const {
    monthlyRate,
    loanStartDate,
    monthlyPaymentAmount,
    getPaymentsForMonth,
    getStartDatePayments,
  } = useLoanCalculations(loan, loanPayments);

  const actualLoanStats = useMemo(() => {
    const totalPaid = loanPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Process payments chronologically (not by month)
    let interestPaid = 0;
    let principalPaid = 0;
    let balance = loan.principal;

    // Sort all payments by date
    const sortedPayments = [...loanPayments].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    // Process each payment individually
    sortedPayments.forEach(payment => {
      if (payment.loanId === loan.id) {
        const interestOwed = balance * monthlyRate;
        const interestFromPayment = Math.min(interestOwed, payment.amount);
        const principalFromPayment = Math.max(0, payment.amount - interestOwed);

        interestPaid += interestFromPayment;
        principalPaid += principalFromPayment;
        balance = Math.max(0, balance - principalFromPayment);
      }
    });

    return {
      totalPaid,
      principalPaid,
      interestPaid,
      remainingBalance: balance,
    };
  }, [loan, loanPayments, monthlyRate]);

  return actualLoanStats;
};
