import { User, Loan, Payment, LoanType, InterestAccrualMethod } from '../types';

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
  disbursementDate: Date,
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly' = 'monthly',
  loanType: LoanType = 'personal',
  minimumPayment?: number,
  paymentDueDay?: number,
  firstPaymentDueDate?: Date,
  interestAccrualMethod: InterestAccrualMethod = 'daily',
  isSubsidized?: boolean,
  interestStartDate?: Date,
  gracePeriodMonths?: number
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
    disbursementDate,
    interestStartDate: interestStartDate || disbursementDate, // Default to disbursementDate if not provided
    firstPaymentDueDate: firstPaymentDueDate || disbursementDate, // Default to disbursementDate if not provided
    paymentFrequency,
    minimumPayment,
    paymentDueDay,
    interestAccrualMethod,
    isSubsidized,
    gracePeriodMonths,
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
