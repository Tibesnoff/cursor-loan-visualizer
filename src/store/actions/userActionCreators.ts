import { User } from '../../types';
import { createUser } from '../../utils/dataUtils';
import { validateUser } from '../../utils/validationUtils';
import { USER_ACTIONS } from '../constants/userActionTypes';

// Action creators
export const userActionCreators = {
  setLoading: (loading: boolean) => ({
    type: USER_ACTIONS.SET_LOADING,
    payload: loading,
  }),

  setError: (error: string | null) => ({
    type: USER_ACTIONS.SET_ERROR,
    payload: error,
  }),

  clearError: () => ({
    type: USER_ACTIONS.CLEAR_ERROR,
  }),

  setUser: (user: User) => ({
    type: USER_ACTIONS.SET_USER,
    payload: user,
  }),

  updateUser: (updates: Partial<User>) => ({
    type: USER_ACTIONS.UPDATE_USER,
    payload: updates,
  }),

  clearUser: () => ({
    type: USER_ACTIONS.CLEAR_USER,
  }),
};

// Business logic functions
export const userBusinessLogic = {
  /**
   * Creates a new user with validation
   */
  createUser: (name: string, email: string): { user: User; error?: string } => {
    try {
      // Validate the user data
      const validation = validateUser({ name, email });
      if (!validation.isValid) {
        return {
          user: {} as User,
          error: validation.error || 'Invalid user data',
        };
      }

      // Create the user
      const user = createUser(name, email);
      return { user };
    } catch (error) {
      return {
        user: {} as User,
        error: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  },

  /**
   * Validates user updates
   */
  validateUserUpdate: (
    updates: Partial<User>
  ): { isValid: boolean; error?: string } => {
    try {
      // Validate the updates
      const validation = validateUser(updates as User);
      if (!validation.isValid) {
        return {
          isValid: false,
          error: validation.error || 'Invalid user update data',
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to validate user update',
      };
    }
  },

  /**
   * Checks if user can be deleted
   */
  canDeleteUser: (
    user: User,
    loans: any[]
  ): { canDelete: boolean; error?: string } => {
    try {
      // Check if user has loans
      const hasLoans = loans.some(loan => loan.userId === user.id);

      if (hasLoans) {
        return {
          canDelete: false,
          error:
            'Cannot delete user with existing loans. Please delete all loans for this user first.',
        };
      }

      return { canDelete: true };
    } catch (error) {
      return {
        canDelete: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check if user can be deleted',
      };
    }
  },
};
