import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';
import { calculateInterestBetweenDates } from '../utils/interestCalculations';

export const useActualLoanStats = (loan: Loan, loanPayments: Payment[]) => {
  const {
    monthlyRate,
    loanStartDate,
    paymentsStartDate,
    monthlyPaymentAmount,
    getPaymentsForMonth,
    getStartDatePayments,
  } = useLoanCalculations(loan, loanPayments);

  const actualLoanStats = useMemo(() => {
    // Include all payments for this loan (including those before payments start date)
    const relevantPayments = loanPayments.filter(
      payment => payment.loanId === loan.id
    );

    const totalPaid = relevantPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Process payments chronologically (not by month)
    let interestPaid = 0;
    let principalPaid = 0;
    let balance = loan.principal;

    // Sort all relevant payments by date
    const sortedPayments = [...relevantPayments].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    // Process each payment individually using the selected interest accrual method
    // Use payments start date for interest calculation, but include all payments
    let lastPaymentDate = loan.paymentsStartDate
      ? new Date(loan.paymentsStartDate)
      : new Date(loan.startDate);

    sortedPayments.forEach((payment, index) => {
      const paymentDate = new Date(payment.paymentDate);

      // Calculate interest accrued over this period using the selected method
      const interestOwed = calculateInterestBetweenDates(
        balance,
        loan.interestRate,
        lastPaymentDate,
        paymentDate,
        loan.interestAccrualMethod
      );

      const interestFromPayment = Math.min(interestOwed, payment.amount);
      const principalFromPayment = Math.max(0, payment.amount - interestOwed);

      interestPaid += interestFromPayment;
      principalPaid += principalFromPayment;
      balance = Math.max(0, balance - principalFromPayment);

      // Update last payment date for next calculation
      lastPaymentDate = paymentDate;
    });

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

      // Add the interest accrued since last payment to the remaining balance
      balance += interestSinceLastPayment;
    }

    return {
      totalPaid,
      principalPaid,
      interestPaid,
      remainingBalance: balance,
    };
  }, [loan, loanPayments, monthlyRate]);

  return actualLoanStats;
};
