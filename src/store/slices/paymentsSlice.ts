import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payment } from '../../types';
import { handleReduxError } from '../../utils/reduxSliceFactory';

interface PaymentsState {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PaymentsState = {
  payments: [],
  isLoading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
      state.error = null;
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.push(action.payload);
      state.error = null;
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      try {
        const updatedPayment = action.payload;
        const index = state.payments.findIndex(
          payment => payment.id === updatedPayment.id
        );
        if (index !== -1) {
          state.payments[index] = updatedPayment;
          state.error = null;
        } else {
          state.error = 'Payment not found for update';
        }
      } catch (error) {
        handleReduxError(state, error, 'Failed to update payment');
      }
    },
    deletePayment: (state, action: PayloadAction<string>) => {
      try {
        const initialLength = state.payments.length;
        state.payments = state.payments.filter(
          payment => payment.id !== action.payload
        );

        if (state.payments.length === initialLength) {
          state.error = 'Payment not found for deletion';
          return;
        }

        state.error = null;
      } catch (error) {
        handleReduxError(state, error, 'Failed to delete payment');
      }
    },
    clearPayments: state => {
      state.payments = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setPayments,
  addPayment,
  updatePayment,
  deletePayment,
  clearPayments,
} = paymentsSlice.actions;
export default paymentsSlice.reducer;
