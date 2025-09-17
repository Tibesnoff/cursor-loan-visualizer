/**
 * Utility functions for formatting data display
 */

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number as currency for Ant Design Statistic component
 */
export function formatCurrencyForStatistic(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '$0.00';
  return formatCurrency(numValue);
}

/**
 * Formats a number as a percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a date for display
 */
export function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    ...options,
  }).format(date);
}

/**
 * Formats a date range
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = formatDate(startDate, { month: 'short', day: 'numeric' });
  const end = formatDate(endDate, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} - ${end}`;
}

/**
 * Formats a duration in months to a human-readable string
 */
export function formatDuration(months: number): string {
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Formats a large number with appropriate units (K, M, B)
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Formats a loan type for display
 */
export function formatLoanType(loanType: string): string {
  return loanType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a payment frequency for display
 */
export function formatPaymentFrequency(frequency: string): string {
  return frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase();
}

/**
 * Formats an interest accrual method for display
 */
export function formatInterestAccrualMethod(method: string): string {
  return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
}
