import {
  LOAN_TYPES,
  INTEREST_ACCRUAL_METHODS,
  PAYMENT_FREQUENCIES,
} from '../constants';

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Loan types
export type LoanType = (typeof LOAN_TYPES)[keyof typeof LOAN_TYPES];

export type InterestAccrualMethod =
  (typeof INTEREST_ACCRUAL_METHODS)[keyof typeof INTEREST_ACCRUAL_METHODS];

export type PaymentFrequency =
  (typeof PAYMENT_FREQUENCIES)[keyof typeof PAYMENT_FREQUENCIES];

export interface Loan {
  id: string;
  userId: string;
  name: string;
  loanType: LoanType;
  principal: number;
  interestRate: number; // Annual percentage rate
  termMonths: number; // 0 for loans without fixed terms
  startDate: Date;
  paymentsStartDate?: Date; // When payments actually begin (can be different from startDate)
  paymentFrequency: PaymentFrequency;
  minimumPayment?: number; // Required for credit cards and student loans
  paymentDueDay?: number; // Day of month when payment is due (1-31)
  interestAccrualMethod: InterestAccrualMethod; // How interest is calculated
  isSubsidized?: boolean; // For student loans - affects interest accrual during grace periods
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  paymentDate: Date;
  remainingBalance: number;
  isExtraPayment: boolean;
  notes?: string;
  createdAt: Date;
}

// App state types
export interface AppState {
  user: User | null;
  loans: Loan[];
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
}
