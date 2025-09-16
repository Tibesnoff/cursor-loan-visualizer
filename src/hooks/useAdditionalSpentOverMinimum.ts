import { useMemo } from 'react';
import { Loan, Payment } from '../types';

interface UseAdditionalSpentOverMinimumProps {
  loan: Loan;
  loanPayments: Payment[];
  monthlyPayment: number;
}

export const useAdditionalSpentOverMinimum = ({
  loan,
  loanPayments,
  monthlyPayment,
}: UseAdditionalSpentOverMinimumProps) => {
  const additionalSpentOverMinimum = useMemo(() => {
    const minimumAmount = loan.minimumPayment || monthlyPayment;
    const loanStartDate = new Date(loan.startDate);
    const currentDate = new Date();

    // Filter out future payments - only count payments made up to today
    const paymentsUpToToday = loanPayments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      return payment.loanId === loan.id && paymentDate <= currentDate;
    });

    // If no payments have been made up to today, additional spent is 0
    if (paymentsUpToToday.length === 0) {
      return 0;
    }

    // Calculate total paid up to today
    const totalPaidUpToToday = paymentsUpToToday.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate months since loan started
    // For same-day payments, we expect at least 1 payment
    const monthsSinceStart = Math.max(
      1,
      (currentDate.getFullYear() - loanStartDate.getFullYear()) * 12 +
        (currentDate.getMonth() - loanStartDate.getMonth()) +
        1
    );

    // Calculate what should have been paid at minimum up to today
    const expectedMinimumTotal = minimumAmount * monthsSinceStart;

    // Debug logging
    console.log('Additional Spent Over Minimum Debug:', {
      totalPaidUpToToday,
      minimumAmount,
      monthsSinceStart,
      expectedMinimumTotal,
      loanStartDate: loanStartDate.toDateString(),
      currentDate: currentDate.toDateString(),
      futurePayments: loanPayments.length - paymentsUpToToday.length,
      result: Math.max(0, totalPaidUpToToday - expectedMinimumTotal),
    });

    // Additional spent over minimum (only for payments made up to today)
    return Math.max(0, totalPaidUpToToday - expectedMinimumTotal);
  }, [loan, loanPayments, monthlyPayment]);

  return additionalSpentOverMinimum;
};
