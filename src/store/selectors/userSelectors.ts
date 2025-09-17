import { RootState } from '../index';

// Basic selectors
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;

// Derived selectors
export const selectIsUserLoggedIn = (state: RootState) =>
  !!state.user.currentUser;

export const selectUserLoans = (state: RootState) => {
  const currentUser = state.user.currentUser;
  if (!currentUser) return [];
  return state.loans.loans.filter(loan => loan.userId === currentUser.id);
};

export const selectUserPayments = (state: RootState) => {
  const currentUser = state.user.currentUser;
  if (!currentUser) return [];
  const userLoans = state.loans.loans.filter(
    loan => loan.userId === currentUser.id
  );
  const userLoanIds = userLoans.map(loan => loan.id);
  return state.payments.payments.filter(payment =>
    userLoanIds.includes(payment.loanId)
  );
};

export const selectUserTotalLoanAmount = (state: RootState) => {
  const userLoans = selectUserLoans(state);
  return userLoans.reduce((total, loan) => total + loan.principal, 0);
};

export const selectUserTotalPaid = (state: RootState) => {
  const userPayments = selectUserPayments(state);
  return userPayments.reduce((total, payment) => total + payment.amount, 0);
};

export const selectUserTotalInterestPaid = (state: RootState) => {
  const userPayments = selectUserPayments(state);
  return userPayments.reduce(
    (total, payment) => total + payment.interestAmount,
    0
  );
};
