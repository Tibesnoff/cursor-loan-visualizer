// User types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Loan types
export type LoanType =
  | 'personal'
  | 'auto'
  | 'mortgage'
  | 'student'
  | 'credit_card'
  | 'business'
  | 'home_equity';

export type InterestAccrualMethod = 'daily' | 'monthly';

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
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  minimumPayment?: number; // Required for credit cards and student loans
  paymentDueDay?: number; // Day of month when payment is due (1-31)
  interestAccrualMethod: InterestAccrualMethod; // How interest is calculated
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

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'loan_visualizer_user',
  LOANS: 'loan_visualizer_loans',
  PAYMENTS: 'loan_visualizer_payments',
} as const;
