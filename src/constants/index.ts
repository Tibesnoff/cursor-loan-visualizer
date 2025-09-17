// Loan Types
export const LOAN_TYPES = {
  PERSONAL: 'personal',
  AUTO: 'auto',
  MORTGAGE: 'mortgage',
  STUDENT: 'student',
  CREDIT_CARD: 'credit_card',
  BUSINESS: 'business',
  HOME_EQUITY: 'home_equity',
} as const;

// Interest Accrual Methods
export const INTEREST_ACCRUAL_METHODS = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
} as const;

// Payment Frequencies
export const PAYMENT_FREQUENCIES = {
  MONTHLY: 'monthly',
  BI_WEEKLY: 'bi-weekly',
  WEEKLY: 'weekly',
} as const;

// Default Values
export const DEFAULTS = {
  LOAN_TERM_MONTHS: 360, // 30 years
  MAX_LOAN_TERM_MONTHS: 600, // 50 years
  MIN_PAYMENT_DUE_DAY: 1,
  MAX_PAYMENT_DUE_DAY: 31,
  CHART_MAX_MONTHS: 120, // 10 years for minimum payment loans
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  USER: 'loan_visualizer_user',
  LOANS: 'loan_visualizer_loans',
  PAYMENTS: 'loan_visualizer_payments',
} as const;

// UI Constants
export const UI = {
  MODAL_WIDTH: 600,
  TABLE_PAGE_SIZE: 10,
  CARD_PADDING: 20,
  SECTION_MARGIN: 32,
} as const;
