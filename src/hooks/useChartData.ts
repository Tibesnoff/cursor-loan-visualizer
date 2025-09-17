import { useMemo, useRef, useEffect } from 'react';
import { Loan, Payment } from '../types';
import {
  createStableArray,
  createCleanupFunction,
  limitArraySize,
  withIterationLimit,
} from '../utils/memoryUtils';

interface UseChartDataProps {
  loan: Loan;
  loanPayments?: Payment[];
}

export const useChartData = ({
  loan,
  loanPayments = [],
}: UseChartDataProps) => {
  // Create cleanup function for this hook
  const cleanup = useRef(createCleanupFunction());

  // Cleanup on unmount
  useEffect(() => {
    const cleanupFn = cleanup.current;
    return () => {
      cleanupFn.cleanup();
    };
  }, []);

  // Memoize filtered and sorted payments to prevent unnecessary recalculations
  const relevantPayments = useMemo(() => {
    const limitedPayments = limitArraySize(loanPayments, 1000); // Limit to 1000 payments
    return createStableArray(limitedPayments).filter(
      payment => payment.loanId === loan.id
    );
  }, [loanPayments, loan.id]);

  const sortedPayments = useMemo(() => {
    return [...createStableArray(relevantPayments)].sort(
      (a, b) =>
        new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );
  }, [relevantPayments]);

  // Memoize monthly rate calculation
  const monthlyRate = useMemo(() => {
    return loan.interestRate / 100 / 12;
  }, [loan.interestRate]);

  const totalCostData = useMemo(() => {
    // Calculate projected total interest over the entire loan term
    let projectedTotalInterest = 0;

    if (loan.termMonths > 0) {
      // For loans with fixed terms, calculate total interest using standard amortization
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
      // Start with current balance after existing payments
      let balance = loan.principal;
      let totalInterest = 0;
      let months = 0;
      const maxMonths = 600; // Cap at 50 years to prevent infinite loops

      // Process existing payments chronologically
      for (const payment of sortedPayments) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = Math.max(0, payment.amount - interestPayment);

        totalInterest += Math.min(interestPayment, payment.amount);
        balance = Math.max(0, balance - principalPayment);
      }

      // Now simulate future minimum payments until balance reaches 0
      // Use iteration limit to prevent infinite loops
      withIterationLimit(
        () => {
          while (balance > 0.01 && months < maxMonths) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.min(
              (loan.minimumPayment || 0) - interestPayment,
              balance
            );

            totalInterest += interestPayment;
            balance -= principalPayment;
            months++;
          }
        },
        maxMonths,
        'Minimum payment calculation exceeded maximum iterations'
      );

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
    loan.termMonths,
    loan.minimumPayment,
    monthlyRate,
    sortedPayments,
  ]);

  const oneTimePaymentData = useMemo(() => {
    const monthlyPayment =
      loan.minimumPayment ||
      (loan.termMonths > 0
        ? (loan.principal *
            monthlyRate *
            Math.pow(1 + monthlyRate, loan.termMonths)) /
          (Math.pow(1 + monthlyRate, loan.termMonths) - 1)
        : 0);

    if (monthlyPayment === 0) return [];

    const interestPortion = loan.principal * monthlyRate;
    const principalPortion = Math.max(0, monthlyPayment - interestPortion);

    return [
      { name: 'Interest', value: interestPortion, color: '#fa8c16' },
      { name: 'Principal', value: principalPortion, color: '#52c41a' },
    ];
  }, [loan.principal, loan.termMonths, loan.minimumPayment, monthlyRate]);

  return {
    totalCostData: totalCostData.data,
    totalCost: totalCostData.totalCost,
    oneTimePaymentData,
  };
};
