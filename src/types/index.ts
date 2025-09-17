import {
  LOAN_TYPES,
  INTEREST_ACCRUAL_METHODS,
  PAYMENT_FREQUENCIES,
} from '../constants';

// Utility types
export type NonEmptyString = string & { readonly __brand: 'NonEmptyString' };
export type PositiveNumber = number & { readonly __brand: 'PositiveNumber' };
export type NonNegativeNumber = number & {
  readonly __brand: 'NonNegativeNumber';
};
export type DateString = string & { readonly __brand: 'DateString' };
export type UUID = string & { readonly __brand: 'UUID' };

// Branded types for better type safety
export type Brand<T, B> = T & { readonly __brand: B };

// Strict string types
export type StrictString<T extends string> = T;
export type EmailAddress = Brand<string, 'EmailAddress'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;

// User types
export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Loan types
export type LoanType = (typeof LOAN_TYPES)[keyof typeof LOAN_TYPES];

export type InterestAccrualMethod =
  (typeof INTEREST_ACCRUAL_METHODS)[keyof typeof INTEREST_ACCRUAL_METHODS];

export type PaymentFrequency =
  (typeof PAYMENT_FREQUENCIES)[keyof typeof PAYMENT_FREQUENCIES];

export interface Loan {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly loanType: LoanType;
  readonly principal: number;
  readonly interestRate: number; // Annual percentage rate
  readonly termMonths: number; // 0 for loans without fixed terms
  readonly disbursementDate: Date; // When the loan was disbursed/funded
  readonly interestStartDate: Date; // When interest begins accruing (can be different from disbursementDate)
  readonly firstPaymentDueDate: Date; // When the first payment is due
  readonly paymentFrequency: PaymentFrequency;
  readonly minimumPayment?: number; // Required for credit cards and student loans
  readonly paymentDueDay?: number; // Day of month when payment is due (1-31)
  readonly interestAccrualMethod: InterestAccrualMethod; // How interest is calculated
  readonly isSubsidized?: boolean; // For student loans - affects interest accrual during grace periods
  readonly gracePeriodMonths?: number; // Grace period for student loans (typically 6 months)
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface Payment {
  readonly id: string;
  readonly loanId: string;
  readonly amount: number;
  readonly principalAmount: number;
  readonly interestAmount: number;
  readonly paymentDate: Date;
  readonly remainingBalance: number;
  readonly isExtraPayment: boolean;
  readonly notes?: string;
  readonly createdAt: Date;
}

// App state types
export interface AppState {
  readonly user: User | null;
  readonly loans: readonly Loan[];
  readonly payments: readonly Payment[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

// Redux state types
export interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoansState {
  loans: Loan[];
  isLoading: boolean;
  error: string | null;
}

export interface PaymentsState {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
}

// Form types
export interface LoanFormData {
  readonly name: string;
  readonly loanType: LoanType;
  readonly principal: number;
  readonly interestRate: number;
  readonly termMonths: number;
  readonly disbursementDate: Date;
  readonly interestStartDate: Date;
  readonly firstPaymentDueDate: Date;
  readonly paymentFrequency: PaymentFrequency;
  readonly minimumPayment?: number;
  readonly paymentDueDay?: number;
  readonly interestAccrualMethod: InterestAccrualMethod;
  readonly isSubsidized?: boolean;
  readonly gracePeriodMonths?: number;
}

export interface PaymentFormData {
  readonly loanId: string;
  readonly amount: number;
  readonly paymentDate: Date;
  readonly notes?: string;
}

// API response types
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: Date;
}

// Calculation result types
export interface LoanCalculationResult {
  readonly monthlyPayment: number;
  readonly totalInterest: number;
  readonly totalCost: number;
  readonly payoffDate: Date;
  readonly remainingBalance: number;
}

export interface PaymentScheduleDataPoint {
  readonly month: number;
  readonly balance: number;
  readonly minimumPaymentBalance: number;
  readonly startingBalance: number;
  readonly totalPayments: number;
  readonly scheduledPayment: number;
  readonly paymentUsed: number;
  readonly totalInterest: number;
  readonly monthName: string;
  readonly year: number;
  readonly actualDate: string;
}

// Chart data types
export interface ChartDataPoint {
  readonly name: string;
  readonly value: number;
  readonly color: string;
}

export interface ChartData {
  readonly data: readonly ChartDataPoint[];
  readonly totalCost?: number;
}

// Utility types for better type safety
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Type guards
export function isUUID(value: unknown): value is UUID {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

export function isPositiveNumber(value: unknown): value is PositiveNumber {
  return typeof value === 'number' && value > 0 && Number.isFinite(value);
}

export function isNonNegativeNumber(
  value: unknown
): value is NonNegativeNumber {
  return typeof value === 'number' && value >= 0 && Number.isFinite(value);
}

export function isNonEmptyString(value: unknown): value is NonEmptyString {
  return typeof value === 'string' && value.length > 0;
}

export function isEmailAddress(value: unknown): value is EmailAddress {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isPaymentDueDay(
  value: unknown
): value is Brand<number, 'PaymentDueDay'> {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 31
  );
}
