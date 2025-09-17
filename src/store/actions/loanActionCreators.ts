import { Loan, LoanFormData, Payment } from '../../types';
import { createLoan } from '../../utils/dataUtils';
import { validateLoan } from '../../utils/validationUtils';
import { LOAN_ACTIONS } from '../constants/loanActionTypes';

// Action creators
export const loanActionCreators = {
  setLoading: (loading: boolean) => ({
    type: LOAN_ACTIONS.SET_LOADING,
    payload: loading,
  }),

  setError: (error: string | null) => ({
    type: LOAN_ACTIONS.SET_ERROR,
    payload: error,
  }),

  clearError: () => ({
    type: LOAN_ACTIONS.CLEAR_ERROR,
  }),

  setLoans: (loans: Loan[]) => ({
    type: LOAN_ACTIONS.SET_LOANS,
    payload: loans,
  }),

  addLoan: (loan: Loan) => ({
    type: LOAN_ACTIONS.ADD_LOAN,
    payload: loan,
  }),

  updateLoan: (id: string, updates: Partial<Loan>) => ({
    type: LOAN_ACTIONS.UPDATE_LOAN,
    payload: { id, updates },
  }),

  deleteLoan: (id: string) => ({
    type: LOAN_ACTIONS.DELETE_LOAN,
    payload: id,
  }),

  clearLoans: () => ({
    type: LOAN_ACTIONS.CLEAR_LOANS,
  }),
};

// Business logic functions
export const loanBusinessLogic = {
  /**
   * Creates a new loan with validation
   */
  createLoan: (
    userId: string,
    formData: LoanFormData
  ): { loan: Loan; error?: string } => {
    try {
      // Validate the form data
      const validation = validateLoan(formData);
      if (!validation.isValid) {
        return {
          loan: {} as Loan,
          error: validation.error || 'Invalid loan data',
        };
      }

      // Create the loan
      const loan = createLoan(
        userId,
        formData.name,
        formData.principal,
        formData.interestRate,
        formData.termMonths,
        formData.disbursementDate,
        formData.paymentFrequency,
        formData.loanType,
        formData.minimumPayment,
        formData.paymentDueDay,
        formData.firstPaymentDueDate,
        formData.interestAccrualMethod,
        formData.isSubsidized,
        formData.interestStartDate,
        formData.gracePeriodMonths
      );

      return { loan };
    } catch (error) {
      return {
        loan: {} as Loan,
        error: error instanceof Error ? error.message : 'Failed to create loan',
      };
    }
  },

  /**
   * Validates loan updates
   */
  validateLoanUpdate: (
    loanId: string,
    updates: Partial<Loan>
  ): { isValid: boolean; error?: string } => {
    try {
      if (!loanId) {
        return {
          isValid: false,
          error: 'Loan ID is required for update',
        };
      }

      // Validate the updates
      const validation = validateLoan(updates as Loan);
      if (!validation.isValid) {
        return {
          isValid: false,
          error: validation.error || 'Invalid loan update data',
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to validate loan update',
      };
    }
  },

  /**
   * Checks if a loan can be deleted
   */
  canDeleteLoan: (
    loan: Loan,
    payments: Payment[]
  ): { canDelete: boolean; error?: string } => {
    try {
      // Check if loan has payments
      const hasPayments = payments.some(payment => payment.loanId === loan.id);

      if (hasPayments) {
        return {
          canDelete: false,
          error:
            'Cannot delete loan with existing payments. Please delete all payments for this loan first.',
        };
      }

      return { canDelete: true };
    } catch (error) {
      return {
        canDelete: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check if loan can be deleted',
      };
    }
  },
};
