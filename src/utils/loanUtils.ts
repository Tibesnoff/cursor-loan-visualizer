import { LoanType } from '../types';

// Loan type definitions with all metadata
export const LOAN_TYPES = [
  {
    value: 'personal' as LoanType,
    label: 'Personal Loan',
    hasTerm: true,
    hasCollateral: false,
    needsMinimumPayment: false,
    description: 'Unsecured loan with fixed monthly payments',
    color: 'blue',
  },
  {
    value: 'auto' as LoanType,
    label: 'Auto Loan',
    hasTerm: true,
    hasCollateral: true,
    needsMinimumPayment: false,
    description: 'Secured by the vehicle with fixed monthly payments',
    color: 'green',
  },
  {
    value: 'mortgage' as LoanType,
    label: 'Mortgage',
    hasTerm: true,
    hasCollateral: true,
    needsMinimumPayment: false,
    description: 'Secured by the property with fixed monthly payments',
    color: 'purple',
  },
  {
    value: 'student' as LoanType,
    label: 'Student Loan',
    hasTerm: false,
    hasCollateral: false,
    needsMinimumPayment: true,
    description: 'Monthly minimum payments, can pay more to reduce interest',
    color: 'orange',
  },
  {
    value: 'credit_card' as LoanType,
    label: 'Credit Card',
    hasTerm: false,
    hasCollateral: false,
    needsMinimumPayment: true,
    description: 'Monthly minimum payments, revolving credit line',
    color: 'red',
  },
  {
    value: 'business' as LoanType,
    label: 'Business Loan',
    hasTerm: true,
    hasCollateral: true,
    needsMinimumPayment: false,
    description: 'Secured business loan with fixed monthly payments',
    color: 'cyan',
  },
  {
    value: 'home_equity' as LoanType,
    label: 'Home Equity Loan',
    hasTerm: true,
    hasCollateral: true,
    needsMinimumPayment: false,
    description: 'Secured by home equity with fixed monthly payments',
    color: 'magenta',
  },
];

// Get loan type color
export const getLoanTypeColor = (loanType: LoanType): string => {
  const type = LOAN_TYPES.find(t => t.value === loanType);
  return type?.color || 'default';
};

// Get loan type label
export const getLoanTypeLabel = (loanType: LoanType): string => {
  const type = LOAN_TYPES.find(t => t.value === loanType);
  return type?.label || loanType;
};

// Get loan type definition
export const getLoanTypeDefinition = (loanType: LoanType) => {
  return LOAN_TYPES.find(t => t.value === loanType);
};

// Get all loan types for form dropdowns
export const getLoanTypesForForm = () => {
  return LOAN_TYPES.map(type => ({
    value: type.value,
    label: type.label,
    hasTerm: type.hasTerm,
    hasCollateral: type.hasCollateral,
    needsMinimumPayment: type.needsMinimumPayment,
    description: type.description,
  }));
};
