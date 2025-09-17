import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Payment } from '../../types';

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
      const updatedPayment = action.payload;
      const index = state.payments.findIndex(
        payment => payment.id === updatedPayment.id
      );
      if (index !== -1) {
        state.payments[index] = updatedPayment;
      }
      state.error = null;
    },
    deletePayment: (state, action: PayloadAction<string>) => {
      state.payments = state.payments.filter(
        payment => payment.id !== action.payload
      );
      state.error = null;
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
