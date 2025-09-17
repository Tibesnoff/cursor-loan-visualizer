import { Payment, PaymentFormData, Loan } from '../../types';
import { createPayment } from '../../utils/dataUtils';
import { validatePayment } from '../../utils/validationUtils';
import {
  normalizeLoanDates,
  applyPaymentToBalance,
} from '../../utils/consolidatedCalculations';
import { PAYMENT_ACTIONS } from '../constants/paymentActionTypes';

// Action creators
export const paymentActionCreators = {
  setLoading: (loading: boolean) => ({
    type: PAYMENT_ACTIONS.SET_LOADING,
    payload: loading,
  }),

  setError: (error: string | null) => ({
    type: PAYMENT_ACTIONS.SET_ERROR,
    payload: error,
  }),

  clearError: () => ({
    type: PAYMENT_ACTIONS.CLEAR_ERROR,
  }),

  setPayments: (payments: Payment[]) => ({
    type: PAYMENT_ACTIONS.SET_PAYMENTS,
    payload: payments,
  }),

  addPayment: (payment: Payment) => ({
    type: PAYMENT_ACTIONS.ADD_PAYMENT,
    payload: payment,
  }),

  updatePayment: (payment: Payment) => ({
    type: PAYMENT_ACTIONS.UPDATE_PAYMENT,
    payload: payment,
  }),

  deletePayment: (id: string) => ({
    type: PAYMENT_ACTIONS.DELETE_PAYMENT,
    payload: id,
  }),

  clearPayments: () => ({
    type: PAYMENT_ACTIONS.CLEAR_PAYMENTS,
  }),
};

// Business logic functions
export const paymentBusinessLogic = {
  /**
   * Creates a new payment with proper calculation
   */
  createPayment: (
    loan: Loan,
    formData: PaymentFormData,
    existingPayments: Payment[]
  ): { payment: Payment; error?: string } => {
    try {
      // Validate the form data
      const validation = validatePayment(formData);
      if (!validation.isValid) {
        return {
          payment: {} as Payment,
          error: validation.error || 'Invalid payment data',
        };
      }

      // Calculate current balance
      const loanPayments = existingPayments
        .filter(p => p.loanId === loan.id)
        .sort(
          (a, b) =>
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime()
        );

      const normalizedLoan = normalizeLoanDates(loan);
      let currentBalance = loan.principal;
      let lastPaymentDate = normalizedLoan.interestStartDate;

      // Process existing payments to get current balance
      for (const existingPayment of loanPayments) {
        const paymentResult = applyPaymentToBalance(
          currentBalance,
          existingPayment,
          normalizedLoan,
          lastPaymentDate
        );
        currentBalance = paymentResult.newBalance;
        lastPaymentDate = new Date(existingPayment.paymentDate);
      }

      // Create temporary payment for calculation
      const tempPayment = {
        id: 'temp',
        loanId: loan.id,
        amount: formData.amount,
        principalAmount: 0,
        interestAmount: 0,
        paymentDate: formData.paymentDate,
        remainingBalance: 0,
        isExtraPayment: false,
        notes: formData.notes || '',
        createdAt: new Date(),
      };

      // Calculate payment breakdown
      const paymentResult = applyPaymentToBalance(
        currentBalance,
        tempPayment,
        normalizedLoan,
        lastPaymentDate
      );

      // Determine if this is an extra payment
      const isExtraPayment = loan.minimumPayment
        ? formData.amount > loan.minimumPayment
        : false;

      // Create the actual payment
      const payment = createPayment(
        loan.id,
        formData.amount,
        paymentResult.principalPaid,
        paymentResult.interestPaid,
        formData.paymentDate,
        paymentResult.newBalance,
        isExtraPayment,
        formData.notes
      );

      return { payment };
    } catch (error) {
      return {
        payment: {} as Payment,
        error:
          error instanceof Error ? error.message : 'Failed to create payment',
      };
    }
  },

  /**
   * Validates payment updates
   */
  validatePaymentUpdate: (
    paymentId: string,
    updates: Partial<Payment>
  ): { isValid: boolean; error?: string } => {
    try {
      if (!paymentId) {
        return {
          isValid: false,
          error: 'Payment ID is required for update',
        };
      }

      // Validate the updates
      const validation = validatePayment(updates as Payment);
      if (!validation.isValid) {
        return {
          isValid: false,
          error: validation.error || 'Invalid payment update data',
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to validate payment update',
      };
    }
  },

  /**
   * Checks if payment can be deleted
   */
  canDeletePayment: (
    payment: Payment
  ): { canDelete: boolean; error?: string } => {
    try {
      // For now, all payments can be deleted
      // In the future, we might add business rules like:
      // - Cannot delete payments older than X days
      // - Cannot delete payments if it would make balance negative
      return { canDelete: true };
    } catch (error) {
      return {
        canDelete: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check if payment can be deleted',
      };
    }
  },
};
