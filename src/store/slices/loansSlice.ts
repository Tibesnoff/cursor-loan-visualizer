import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Loan } from '../../types';

interface LoansState {
  loans: Loan[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LoansState = {
  loans: [],
  isLoading: false,
  error: null,
};

const loansSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLoans: (state, action: PayloadAction<Loan[]>) => {
      state.loans = action.payload;
      state.error = null;
    },
    addLoan: (state, action: PayloadAction<Loan>) => {
      state.loans.push(action.payload);
      state.error = null;
    },
    updateLoan: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Loan> }>
    ) => {
      const { id, updates } = action.payload;
      const index = state.loans.findIndex(loan => loan.id === id);
      if (index !== -1) {
        state.loans[index] = {
          ...state.loans[index],
          ...updates,
          updatedAt: new Date(),
        };
      }
    },
    deleteLoan: (state, action: PayloadAction<string>) => {
      state.loans = state.loans.filter(loan => loan.id !== action.payload);
    },
    clearLoans: state => {
      state.loans = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setLoans,
  addLoan,
  updateLoan,
  deleteLoan,
  clearLoans,
} = loansSlice.actions;
export default loansSlice.reducer;
