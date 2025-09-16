import { Middleware } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../types';

// Helper functions for localStorage
const saveToStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage: ${error}`);
  }
};

const loadFromStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Failed to load from localStorage: ${error}`);
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
  const userData = loadFromStorage(STORAGE_KEYS.USER);
  if (userData) {
    // Convert date strings back to Date objects
    return {
      ...userData,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
    };
  }
  return null;
};

export const loadLoansFromStorage = () => {
  const loansData = loadFromStorage(STORAGE_KEYS.LOANS);
  if (loansData && Array.isArray(loansData)) {
    // Convert date strings back to Date objects
    return loansData.map(loan => ({
      ...loan,
      startDate: new Date(loan.startDate),
      createdAt: new Date(loan.createdAt),
      updatedAt: new Date(loan.updatedAt),
    }));
  }
  return [];
};

export const loadPaymentsFromStorage = () => {
  const paymentsData = loadFromStorage(STORAGE_KEYS.PAYMENTS);
  if (paymentsData && Array.isArray(paymentsData)) {
    // Convert date strings back to Date objects
    return paymentsData.map(payment => ({
      ...payment,
      paymentDate: new Date(payment.paymentDate),
      createdAt: new Date(payment.createdAt),
    }));
  }
  return [];
};
