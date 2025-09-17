import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import loansReducer from './slices/loansSlice';
import paymentsReducer from './slices/paymentsSlice';
import {
  persistenceMiddleware,
  loadUserFromStorage,
  loadLoansFromStorage,
  loadPaymentsFromStorage,
} from './middleware/persistenceMiddleware';
import { UserState, LoansState, PaymentsState } from '../types';

export const store = configureStore({
  reducer: {
    user: userReducer,
    loans: loansReducer,
    payments: paymentsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['_persist'],
      },
    }).concat(persistenceMiddleware),
  preloadedState: {
    user: {
      currentUser: loadUserFromStorage(),
      isLoading: false,
      error: null,
    } as UserState,
    loans: {
      loans: loadLoansFromStorage(),
      isLoading: false,
      error: null,
    } as LoansState,
    payments: {
      payments: loadPaymentsFromStorage(),
      isLoading: false,
      error: null,
    } as PaymentsState,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
