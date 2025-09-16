import { useMemo } from 'react';
import { Loan } from '../types';
import { useActualLoanStats } from './useActualLoanStats';

interface UseChartDataProps {
  loan: Loan;
  actualLoanStats: {
    interestPaid: number;
  };
}

export const useChartData = ({ loan, actualLoanStats }: UseChartDataProps) => {
  const totalCostData = useMemo(
    () => [
      { name: 'Principal', value: loan.principal, color: '#1890ff' },
      {
        name: 'Total Interest',
        value: Math.max(actualLoanStats.interestPaid, 1),
        color: '#ff4d4f',
      },
    ],
    [loan.principal, actualLoanStats.interestPaid]
  );

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
    totalCostData,
    oneTimePaymentData,
  };
};
