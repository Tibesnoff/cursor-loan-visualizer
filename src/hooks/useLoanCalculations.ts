import { useMemo } from 'react';
import { Loan, Payment } from '../types';

export const useLoanCalculations = (loan: Loan, loanPayments: Payment[]) => {
  const monthlyRate = loan.interestRate / 100 / 12;
  const loanStartDate = new Date(loan.startDate);
  const paymentsStartDate = loan.paymentsStartDate
    ? new Date(loan.paymentsStartDate)
    : loanStartDate;

  // Calculate monthly payment amount
  const monthlyPaymentAmount = useMemo(() => {
    if (loan.minimumPayment) {
      return loan.minimumPayment;
    } else if (loan.termMonths > 0) {
      return (
        (loan.principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, loan.termMonths)) /
        (Math.pow(1 + monthlyRate, loan.termMonths) - 1)
      );
    }
    return 0;
  }, [loan, monthlyRate]);

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

  return {
    monthlyRate,
    loanStartDate,
    paymentsStartDate,
    monthlyPaymentAmount,
    getPaymentsForMonth,
    getStartDatePayments,
  };
};
