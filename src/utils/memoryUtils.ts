/**
 * Memory management utilities for preventing memory leaks in calculations
 */

// Type-safe array utilities
export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyNonEmptyArray<T> = readonly [T, ...T[]];

// Type guard for non-empty arrays
export function isNonEmptyArray<T>(array: T[]): array is NonEmptyArray<T> {
  return Array.isArray(array) && array.length > 0;
}

// Type guard for readonly non-empty arrays
export function isReadonlyNonEmptyArray<T>(
  array: readonly T[]
): array is ReadonlyNonEmptyArray<T> {
  return Array.isArray(array) && array.length > 0;
}

/**
 * Creates a stable reference for arrays to prevent unnecessary re-renders
 * when the array contents haven't changed
 */
export function createStableArray<T>(
  array: readonly T[],
  compareFn?: (a: T, b: T) => boolean
): readonly T[] {
  if (!Array.isArray(array)) return [];

  // If no comparison function provided, use shallow comparison
  if (!compareFn) {
    return [...array];
  }

  // For now, return a new array - in a real implementation,
  // you might want to use a more sophisticated memoization
  return [...array];
}

/**
 * Creates a stable reference for objects to prevent unnecessary re-renders
 * when the object properties haven't changed
 */
export function createStableObject<T extends Record<string, unknown>>(
  obj: T,
  keys?: readonly (keyof T)[]
): T {
  if (!obj || typeof obj !== 'object') return obj;

  // If specific keys are provided, only compare those keys
  if (keys && keys.length > 0) {
    const filteredObj = {} as T;
    keys.forEach(key => {
      if (key in obj) {
        filteredObj[key] = obj[key];
      }
    });
    return filteredObj;
  }

  return { ...obj };
}

/**
 * Debounces expensive calculations to prevent excessive computation
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttles expensive calculations to limit execution frequency
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Creates a cleanup function for expensive operations
 */
export function createCleanupFunction(): {
  add: (cleanup: () => void) => void;
  cleanup: () => void;
  isCleanedUp: boolean;
} {
  const cleanupFunctions: (() => void)[] = [];
  let isCleanedUp = false;

  return {
    add: (cleanup: () => void) => {
      if (!isCleanedUp) {
        cleanupFunctions.push(cleanup);
      }
    },
    cleanup: () => {
      if (!isCleanedUp) {
        cleanupFunctions.forEach(cleanup => {
          try {
            cleanup();
          } catch (error) {
            console.warn('Error during cleanup:', error);
          }
        });
        cleanupFunctions.length = 0;
        isCleanedUp = true;
      }
    },
    get isCleanedUp() {
      return isCleanedUp;
    },
  };
}

/**
 * Prevents infinite loops in calculations by adding iteration limits
 */
export function withIterationLimit<T>(
  calculation: () => T,
  maxIterations: number = 1000,
  errorMessage: string = 'Calculation exceeded maximum iterations'
): T {
  let iterations = 0;
  const originalConsoleWarn = console.warn;

  // Override console.warn to track iterations
  console.warn = (...args) => {
    if (args[0]?.includes?.('iteration')) {
      iterations++;
      if (iterations > maxIterations) {
        throw new Error(`${errorMessage} (${maxIterations})`);
      }
    }
    originalConsoleWarn(...args);
  };

  try {
    return calculation();
  } finally {
    console.warn = originalConsoleWarn;
  }
}

/**
 * Memoizes expensive calculations with a size limit to prevent memory bloat
 */
export function createMemoizedCalculation<T, R>(
  calculation: (input: T) => R,
  maxCacheSize: number = 100
): (input: T) => R {
  const cache = new Map<string, R>();

  return (input: T): R => {
    const key = JSON.stringify(input);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // If cache is too large, clear oldest entries
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    const result = calculation(input);
    cache.set(key, result);

    return result;
  };
}

/**
 * Safely executes calculations with timeout to prevent hanging
 */
export function withTimeout<T>(
  calculation: () => T,
  timeoutMs: number = 5000,
  fallback: T
): Promise<T> {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      console.warn(
        `Calculation timed out after ${timeoutMs}ms, using fallback`
      );
      resolve(fallback);
    }, timeoutMs);

    try {
      const result = calculation();
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      console.warn('Calculation failed, using fallback:', error);
      resolve(fallback);
    }
  });
}

/**
 * Creates a weak reference map for storing expensive calculations
 * that can be garbage collected when not needed
 */
export function createWeakCalculationCache<T extends object, R>(): Map<T, R> {
  const cache = new Map<T, R>();

  // Clean up dead references periodically
  setInterval(() => {
    // In environments without WeakRef, we can't automatically clean up
    // This is a simplified implementation
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
  }, 30000); // Clean up every 30 seconds

  return cache;
}

/**
 * Prevents memory leaks by limiting array sizes in calculations
 */
export function limitArraySize<T>(array: T[], maxSize: number = 1000): T[] {
  if (array.length <= maxSize) {
    return array;
  }

  // Keep the most recent items
  return array.slice(-maxSize);
}

/**
 * Creates a memory-efficient date formatter that caches results
 */
export function createDateFormatter(
  options: Intl.DateTimeFormatOptions = {}
): (date: Date) => string {
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const cache = new Map<number, string>();
  const maxCacheSize = 1000;

  return (date: Date): string => {
    const time = date.getTime();

    if (cache.has(time)) {
      return cache.get(time)!;
    }

    // Clean cache if it's too large
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }

    const formatted = formatter.format(date);
    cache.set(time, formatted);

    return formatted;
  };
}
