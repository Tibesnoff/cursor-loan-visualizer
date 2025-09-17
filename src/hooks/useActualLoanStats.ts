import { useMemo } from 'react';
import { Loan, Payment } from '../types';
import { useLoanCalculations } from './useLoanCalculations';
import { calculateInterestBetweenDates } from '../utils/interestCalculations';
import {
  calculateEffectiveStartingBalance,
  applyPaymentToBalance,
} from '../utils/loanCalculationUtils';

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

    // Use the new loan calculation utility to get the effective starting balance
    let balance = calculateEffectiveStartingBalance(loan);
    let interestPaid = 0;
    let principalPaid = 0;

    // Sort all relevant payments by date
    const sortedPayments = [...relevantPayments].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    // Process each payment individually using the new utility
    // Use payments start date as the baseline for all calculations
    let lastPaymentDate = loan.paymentsStartDate
      ? new Date(loan.paymentsStartDate)
      : new Date(loan.startDate);

    sortedPayments.forEach((payment, index) => {
      const paymentResult = applyPaymentToBalance(
        balance,
        payment,
        loan.interestRate,
        loan.interestAccrualMethod,
        lastPaymentDate
      );

      balance = paymentResult.newBalance;
      interestPaid += paymentResult.interestPaid;
      principalPaid += paymentResult.principalPaid;

      // Update last payment date for next calculation
      lastPaymentDate = new Date(payment.paymentDate);
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
