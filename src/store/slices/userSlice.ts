import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { handleReduxError } from '../../utils/reduxSliceFactory';

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
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
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      try {
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            ...action.payload,
            updatedAt: new Date(),
          };
          state.error = null;
        } else {
          state.error = 'No user to update';
        }
      } catch (error) {
        handleReduxError(state, error, 'Failed to update user');
      }
    },
    clearUser: state => {
      state.currentUser = null;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setUser,
  updateUser,
  clearUser,
} = userSlice.actions;
export default userSlice.reducer;
