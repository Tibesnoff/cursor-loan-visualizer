import { User, Loan, Payment, LoanType } from '../types';

// Generate unique IDs
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Create a new user
export const createUser = (name: string, email: string): User => {
  const now = new Date();
  return {
    id: generateId(),
    name,
    email,
    createdAt: now,
    updatedAt: now,
  };
};

// Create a new loan
export const createLoan = (
  userId: string,
  name: string,
  principal: number,
  interestRate: number,
  termMonths: number,
  startDate: Date,
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly' = 'monthly',
  loanType: LoanType = 'personal',
  minimumPayment?: number
): Loan => {
  const now = new Date();
  return {
    id: generateId(),
    userId,
    name,
    loanType,
    principal,
    interestRate,
    termMonths,
    startDate,
    paymentFrequency,
    minimumPayment,
    createdAt: now,
    updatedAt: now,
  };
};

// Create a new payment
export const createPayment = (
  loanId: string,
  amount: number,
  principalAmount: number,
  interestAmount: number,
  paymentDate: Date,
  remainingBalance: number,
  isExtraPayment: boolean = false,
  notes?: string
): Payment => {
  const now = new Date();
  return {
    id: generateId(),
    loanId,
    amount,
    principalAmount,
    interestAmount,
    paymentDate,
    remainingBalance,
    isExtraPayment,
    notes,
    createdAt: now,
  };
};

// Calculate monthly payment
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  termMonths: number
): number => {
  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 100 / 12;
  const numerator =
    principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;

  return numerator / denominator;
};

// Get payments for a specific loan
export const getPaymentsForLoan = (
  payments: Payment[],
  loanId: string
): Payment[] => {
  return payments.filter(payment => payment.loanId === loanId);
};

// Calculate total paid for a loan
export const getTotalPaidForLoan = (
  payments: Payment[],
  loanId: string
): number => {
  return getPaymentsForLoan(payments, loanId).reduce(
    (total, payment) => total + payment.amount,
    0
  );
};

// Calculate remaining balance for a loan
export const getRemainingBalanceForLoan = (
  loan: Loan,
  payments: Payment[]
): number => {
  const loanPayments = getPaymentsForLoan(payments, loan.id);
  if (loanPayments.length === 0) {
    return loan.principal;
  }

  // Get the most recent payment's remaining balance
  const sortedPayments = loanPayments.sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  return sortedPayments[0].remainingBalance;
};
