// Payment action types
export const PAYMENT_ACTIONS = {
  SET_LOADING: 'payments/setLoading',
  SET_ERROR: 'payments/setError',
  CLEAR_ERROR: 'payments/clearError',
  SET_PAYMENTS: 'payments/setPayments',
  ADD_PAYMENT: 'payments/addPayment',
  UPDATE_PAYMENT: 'payments/updatePayment',
  DELETE_PAYMENT: 'payments/deletePayment',
  CLEAR_PAYMENTS: 'payments/clearPayments',
} as const;
