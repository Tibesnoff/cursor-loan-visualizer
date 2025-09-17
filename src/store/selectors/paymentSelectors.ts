import { RootState } from '../index';

// Basic selectors
export const selectPayments = (state: RootState) => state.payments.payments;
export const selectPaymentsLoading = (state: RootState) =>
  state.payments.isLoading;
export const selectPaymentsError = (state: RootState) => state.payments.error;

// Derived selectors
export const selectPaymentById = (state: RootState, paymentId: string) =>
  state.payments.payments.find(payment => payment.id === paymentId);

export const selectPaymentsByLoan = (state: RootState, loanId: string) =>
  state.payments.payments.filter(payment => payment.loanId === loanId);

export const selectPaymentsByUser = (state: RootState, userId: string) => {
  const userLoans = state.loans.loans.filter(loan => loan.userId === userId);
  const userLoanIds = userLoans.map(loan => loan.id);
  return state.payments.payments.filter(payment =>
    userLoanIds.includes(payment.loanId)
  );
};

export const selectPaymentsCount = (state: RootState) =>
  state.payments.payments.length;

export const selectTotalPaidAmount = (state: RootState) =>
  state.payments.payments.reduce((total, payment) => total + payment.amount, 0);

export const selectTotalPrincipalPaid = (state: RootState) =>
  state.payments.payments.reduce(
    (total, payment) => total + payment.principalAmount,
    0
  );

export const selectTotalInterestPaid = (state: RootState) =>
  state.payments.payments.reduce(
    (total, payment) => total + payment.interestAmount,
    0
  );

export const selectExtraPayments = (state: RootState) =>
  state.payments.payments.filter(payment => payment.isExtraPayment);

export const selectPaymentsByDateRange = (
  state: RootState,
  startDate: Date,
  endDate: Date
) =>
  state.payments.payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate >= startDate && paymentDate <= endDate;
  });
