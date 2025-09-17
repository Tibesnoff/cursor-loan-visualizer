import { useMemo } from 'react';
import { Loan } from '../types';

interface UseChartDataProps {
  loan: Loan;
  loanPayments?: any[]; // Add loan payments to factor in existing payments
}

export const useChartData = ({
  loan,
  loanPayments = [],
}: UseChartDataProps) => {
  const totalCostData = useMemo(() => {
    // Calculate projected total interest over the entire loan term
    let projectedTotalInterest = 0;

    if (loan.termMonths > 0) {
      // For loans with fixed terms, calculate total interest using standard amortization
      const monthlyRate = loan.interestRate / 100 / 12;
      const monthlyPayment =
        (loan.principal *
          monthlyRate *
          Math.pow(1 + monthlyRate, loan.termMonths)) /
        (Math.pow(1 + monthlyRate, loan.termMonths) - 1);

      if (monthlyPayment > 0) {
        const totalPayments = monthlyPayment * loan.termMonths;
        projectedTotalInterest = totalPayments - loan.principal;
      }
    } else if (loan.minimumPayment) {
      // For minimum payment loans, calculate actual payoff time and total interest
      const monthlyRate = loan.interestRate / 100 / 12;

      // Start with current balance after existing payments
      let balance = loan.principal;
      let totalInterest = 0;
      let months = 0;
      const maxMonths = 600; // Cap at 50 years to prevent infinite loops

      // Apply existing payments first
      const sortedPayments = [...loanPayments]
        .filter(payment => payment.loanId === loan.id)
        .sort(
          (a, b) =>
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime()
        );

      // Process existing payments chronologically
      sortedPayments.forEach(payment => {
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.max(0, payment.amount - interestPayment);

        totalInterest += Math.min(interestPayment, payment.amount);
        balance = Math.max(0, balance - principalPayment);
      });

      // Now simulate future minimum payments until balance reaches 0
      while (balance > 0.01 && months < maxMonths) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.min(
          loan.minimumPayment - interestPayment,
          balance
        );

        totalInterest += interestPayment;
        balance -= principalPayment;
        months++;
      }

      projectedTotalInterest = totalInterest;
    }

    const totalCost = loan.principal + projectedTotalInterest;

    return {
      data: [
        { name: 'Principal', value: loan.principal, color: '#1890ff' },
        {
          name: 'Total Interest',
          value: Math.max(projectedTotalInterest, 1),
          color: '#ff4d4f',
        },
      ],
      totalCost,
    };
  }, [
    loan.principal,
    loan.interestRate,
    loan.termMonths,
    loan.minimumPayment,
    loanPayments,
  ]);

  const oneTimePaymentData = useMemo(() => {
    const monthlyPayment =
      loan.minimumPayment ||
      (loan.termMonths > 0
        ? (loan.principal *
            (loan.interestRate / 100 / 12) *
            Math.pow(1 + loan.interestRate / 100 / 12, loan.termMonths)) /
          (Math.pow(1 + loan.interestRate / 100 / 12, loan.termMonths) - 1)
        : 0);

    if (monthlyPayment === 0) return [];

    const monthlyRate = loan.interestRate / 100 / 12;
    const interestPortion = loan.principal * monthlyRate;
    const principalPortion = Math.max(0, monthlyPayment - interestPortion);

    return [
      { name: 'Interest', value: interestPortion, color: '#fa8c16' },
      { name: 'Principal', value: principalPortion, color: '#52c41a' },
    ];
  }, [loan]);

  return {
    totalCostData: totalCostData.data,
    totalCost: totalCostData.totalCost,
  };
};
