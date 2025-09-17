import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Loan } from '../../types';
import { handleReduxError } from '../../utils/reduxSliceFactory';

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
    clearError: state => {
      state.error = null;
    },
    setLoans: (state, action: PayloadAction<Loan[]>) => {
      state.loans = action.payload;
      state.error = null;
    },
    addLoan: (state, action: PayloadAction<Loan>) => {
      try {
        // Validate loan data
        if (!action.payload || !action.payload.id) {
          state.error = 'Invalid loan data provided';
          return;
        }

        // Check for duplicate loan ID
        const existingLoan = state.loans.find(
          loan => loan.id === action.payload.id
        );
        if (existingLoan) {
          state.error = 'Loan with this ID already exists';
          return;
        }

        state.loans.push(action.payload);
        state.error = null;
      } catch (error) {
        handleReduxError(state, error, 'Failed to add loan');
      }
    },
    updateLoan: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Loan> }>
    ) => {
      try {
        const { id, updates } = action.payload;

        if (!id) {
          state.error = 'Loan ID is required for update';
          return;
        }

        const index = state.loans.findIndex(loan => loan.id === id);
        if (index === -1) {
          state.error = 'Loan not found';
          return;
        }

        state.loans[index] = {
          ...state.loans[index],
          ...updates,
          updatedAt: new Date(),
        };
        state.error = null;
      } catch (error) {
        handleReduxError(state, error, 'Failed to update loan');
      }
    },
    deleteLoan: (state, action: PayloadAction<string>) => {
      try {
        if (!action.payload) {
          state.error = 'Loan ID is required for deletion';
          return;
        }

        const initialLength = state.loans.length;
        state.loans = state.loans.filter(loan => loan.id !== action.payload);

        if (state.loans.length === initialLength) {
          state.error = 'Loan not found for deletion';
          return;
        }

        state.error = null;
      } catch (error) {
        handleReduxError(state, error, 'Failed to delete loan');
      }
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
  clearError,
  setLoans,
  addLoan,
  updateLoan,
  deleteLoan,
  clearLoans,
} = loansSlice.actions;
export default loansSlice.reducer;
