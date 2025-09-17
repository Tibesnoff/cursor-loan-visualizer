import { useMemo } from 'react';
import { useAppSelector } from './redux';
import {
  calculateLoanStatistics,
  calculatePaymentStatistics,
  calculateUserStatistics,
  calculateMultipleLoanStatistics,
  LoanStatistics,
  PaymentStatistics,
  UserStatistics,
} from '../utils/statisticsUtils';

/**
 * Hook for calculating loan statistics with memoization
 */
export const useLoanStatistics = (loanId: string): LoanStatistics | null => {
  const loan = useAppSelector(state =>
    state.loans.loans.find(l => l.id === loanId)
  );
  const payments = useAppSelector(state => state.payments.payments);

  return useMemo(() => {
    if (!loan) return null;
    return calculateLoanStatistics(loan, payments);
  }, [loan, payments]);
};

/**
 * Hook for calculating payment statistics for a loan
 */
export const usePaymentStatistics = (
  loanId: string
): PaymentStatistics | null => {
  const loan = useAppSelector(state =>
    state.loans.loans.find(l => l.id === loanId)
  );
  const payments = useAppSelector(state => state.payments.payments);

  return useMemo(() => {
    if (!loan) return null;
    return calculatePaymentStatistics(loan, payments);
  }, [loan, payments]);
};

/**
 * Hook for calculating user statistics
 */
export const useUserStatistics = (): UserStatistics | null => {
  const currentUser = useAppSelector(state => state.user.currentUser);
  const loans = useAppSelector(state => state.loans.loans);
  const payments = useAppSelector(state => state.payments.payments);

  return useMemo(() => {
    if (!currentUser) return null;
    return calculateUserStatistics(currentUser, loans, payments);
  }, [currentUser, loans, payments]);
};

/**
 * Hook for calculating statistics for all loans
 */
export const useAllLoansStatistics = () => {
  const loans = useAppSelector(state => state.loans.loans);
  const payments = useAppSelector(state => state.payments.payments);

  return useMemo(() => {
    return calculateMultipleLoanStatistics(loans, payments);
  }, [loans, payments]);
};

/**
 * Hook for calculating statistics for loans by user
 */
export const useUserLoansStatistics = (userId: string) => {
  const userLoans = useAppSelector(state =>
    state.loans.loans.filter(loan => loan.userId === userId)
  );
  const payments = useAppSelector(state => state.payments.payments);

  return useMemo(() => {
    return calculateMultipleLoanStatistics(userLoans, payments);
  }, [userLoans, payments]);
};
