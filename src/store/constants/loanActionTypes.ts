// Loan action types
export const LOAN_ACTIONS = {
  SET_LOADING: 'loans/setLoading',
  SET_ERROR: 'loans/setError',
  CLEAR_ERROR: 'loans/clearError',
  SET_LOANS: 'loans/setLoans',
  ADD_LOAN: 'loans/addLoan',
  UPDATE_LOAN: 'loans/updateLoan',
  DELETE_LOAN: 'loans/deleteLoan',
  CLEAR_LOANS: 'loans/clearLoans',
} as const;
