/**
 * Redux utilities to reduce duplication across slices
 */

export interface BaseState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Common validation helper for Redux actions
 */
export function validatePayload<T>(
  payload: T,
  validator: (payload: T) => string | null
): string | null {
  try {
    return validator(payload);
  } catch (error) {
    return error instanceof Error ? error.message : 'Validation failed';
  }
}

/**
 * Common error handling for Redux actions
 */
export function handleReduxError(
  state: BaseState,
  error: unknown,
  defaultMessage: string
): void {
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  state.error = errorMessage;
  state.isLoading = false;
  console.error('Redux action error:', error);
}
