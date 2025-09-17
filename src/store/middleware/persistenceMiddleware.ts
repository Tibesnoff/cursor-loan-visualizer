import { Middleware } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../constants';
import { createError, ErrorType, logError } from '../../utils/errorHandling';

// Helper functions for localStorage
const saveToStorage = (key: string, data: unknown) => {
  try {
    if (!data) {
      console.warn(`Attempting to save null/undefined data for key: ${key}`);
      return;
    }

    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    const storageError = createError(
      ErrorType.STORAGE,
      `Failed to save data to localStorage for key: ${key}`,
      error instanceof Error ? error.message : 'Unknown storage error',
      'STORAGE_SAVE_ERROR'
    );
    logError(storageError, 'persistenceMiddleware');
  }
};

const loadFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    const storageError = createError(
      ErrorType.STORAGE,
      `Failed to load data from localStorage for key: ${key}`,
      error instanceof Error ? error.message : 'Unknown storage error',
      'STORAGE_LOAD_ERROR'
    );
    logError(storageError, 'persistenceMiddleware');
    return null;
  }
};

// Persistence middleware
export const persistenceMiddleware: Middleware = store => next => action => {
  const result = next(action);

  // Get the current state after the action
  const state = store.getState();

  // Type guard to check if action has a type property
  const hasType = (action: unknown): action is { type: string } => {
    return typeof action === 'object' && action !== null && 'type' in action;
  };

  if (!hasType(action)) {
    return result;
  }

  // Persist user data
  if (action.type.startsWith('user/')) {
    if (action.type === 'user/setUser' || action.type === 'user/updateUser') {
      saveToStorage(STORAGE_KEYS.USER, state.user.currentUser);
    } else if (action.type === 'user/clearUser') {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  // Persist loans data
  if (action.type.startsWith('loans/')) {
    if (
      action.type === 'loans/setLoans' ||
      action.type === 'loans/addLoan' ||
      action.type === 'loans/updateLoan' ||
      action.type === 'loans/deleteLoan'
    ) {
      saveToStorage(STORAGE_KEYS.LOANS, state.loans.loans);
    } else if (action.type === 'loans/clearLoans') {
      localStorage.removeItem(STORAGE_KEYS.LOANS);
    }
  }

  // Persist payments data
  if (action.type.startsWith('payments/')) {
    if (
      action.type === 'payments/setPayments' ||
      action.type === 'payments/addPayment' ||
      action.type === 'payments/updatePayment' ||
      action.type === 'payments/deletePayment'
    ) {
      saveToStorage(STORAGE_KEYS.PAYMENTS, state.payments.payments);
    } else if (action.type === 'payments/clearPayments') {
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    }
  }

  return result;
};

// Helper functions to load data from localStorage
export const loadUserFromStorage = () => {
  try {
    const userData = loadFromStorage(STORAGE_KEYS.USER);
    if (userData) {
      // Validate user data structure
      if (!userData.id || !userData.name || !userData.email) {
        const error = createError(
          ErrorType.DATA,
          'Invalid user data structure in localStorage',
          `User data: ${JSON.stringify(userData)}`,
          'INVALID_USER_DATA'
        );
        logError(error, 'loadUserFromStorage');
        return null;
      }

      // Convert date strings back to Date objects
      return {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
      };
    }
    return null;
  } catch (error) {
    const dataError = createError(
      ErrorType.DATA,
      'Failed to load user data from storage',
      error instanceof Error ? error.message : 'Unknown error',
      'USER_LOAD_ERROR'
    );
    logError(dataError, 'loadUserFromStorage');
    return null;
  }
};

export const loadLoansFromStorage = () => {
  try {
    const loansData = loadFromStorage(STORAGE_KEYS.LOANS);
    if (loansData && Array.isArray(loansData)) {
      // Validate and convert date strings back to Date objects
      return loansData
        .map(loan => {
          if (!loan.id || !loan.name || typeof loan.principal !== 'number') {
            const error = createError(
              ErrorType.DATA,
              'Invalid loan data structure in localStorage',
              `Loan: ${JSON.stringify(loan)}`,
              'INVALID_LOAN_DATA'
            );
            logError(error, 'loadLoansFromStorage');
            return null;
          }

          return {
            ...loan,
            startDate: new Date(loan.startDate),
            createdAt: new Date(loan.createdAt),
            updatedAt: new Date(loan.updatedAt),
            paymentsStartDate: loan.paymentsStartDate
              ? new Date(loan.paymentsStartDate)
              : undefined,
          };
        })
        .filter(Boolean); // Remove null entries
    }
    return [];
  } catch (error) {
    const dataError = createError(
      ErrorType.DATA,
      'Failed to load loans data from storage',
      error instanceof Error ? error.message : 'Unknown error',
      'LOANS_LOAD_ERROR'
    );
    logError(dataError, 'loadLoansFromStorage');
    return [];
  }
};

export const loadPaymentsFromStorage = () => {
  try {
    const paymentsData = loadFromStorage(STORAGE_KEYS.PAYMENTS);
    if (paymentsData && Array.isArray(paymentsData)) {
      // Validate and convert date strings back to Date objects
      return paymentsData
        .map(payment => {
          if (
            !payment.id ||
            !payment.loanId ||
            typeof payment.amount !== 'number'
          ) {
            const error = createError(
              ErrorType.DATA,
              'Invalid payment data structure in localStorage',
              `Payment: ${JSON.stringify(payment)}`,
              'INVALID_PAYMENT_DATA'
            );
            logError(error, 'loadPaymentsFromStorage');
            return null;
          }

          return {
            ...payment,
            paymentDate: new Date(payment.paymentDate),
            createdAt: new Date(payment.createdAt),
          };
        })
        .filter(Boolean); // Remove null entries
    }
    return [];
  } catch (error) {
    const dataError = createError(
      ErrorType.DATA,
      'Failed to load payments data from storage',
      error instanceof Error ? error.message : 'Unknown error',
      'PAYMENTS_LOAD_ERROR'
    );
    logError(dataError, 'loadPaymentsFromStorage');
    return [];
  }
};
