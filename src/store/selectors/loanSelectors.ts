import { RootState } from '../index';

// Basic selectors
export const selectLoans = (state: RootState) => state.loans.loans;
export const selectLoansLoading = (state: RootState) => state.loans.isLoading;
export const selectLoansError = (state: RootState) => state.loans.error;

// Derived selectors
export const selectLoanById = (state: RootState, loanId: string) =>
  state.loans.loans.find(loan => loan.id === loanId);

export const selectLoansByUser = (state: RootState, userId: string) =>
  state.loans.loans.filter(loan => loan.userId === userId);

export const selectActiveLoans = (state: RootState) =>
  state.loans.loans.filter(loan => loan.principal > 0);

export const selectLoansCount = (state: RootState) => state.loans.loans.length;

export const selectTotalLoanAmount = (state: RootState) =>
  state.loans.loans.reduce((total, loan) => total + loan.principal, 0);

export const selectLoansByType = (state: RootState, loanType: string) =>
  state.loans.loans.filter(loan => loan.loanType === loanType);
