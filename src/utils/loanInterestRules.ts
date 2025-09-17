import { Loan, LoanType, InterestAccrualMethod } from '../types';

/**
 * Loan type-specific interest calculation rules and logic
 */

export interface InterestCalculationContext {
  loan: Loan;
  paymentDate: Date;
  lastPaymentDate: Date;
  currentBalance: number;
}

export interface InterestCalculationResult {
  interestOwed: number;
  principalPayment: number;
  newBalance: number;
  interestPaid: number;
}

/**
 * Determines if interest should accrue for a given loan type and date range
 */
export function shouldAccrueInterest(
  loan: Loan,
  startDate: Date,
  endDate: Date
): boolean {
  // Interest only accrues from the interest start date onwards
  if (endDate < loan.interestStartDate) {
    return false;
  }

  // For subsidized student loans, no interest accrues during grace period
  // For unsubsidized student loans, interest accrues immediately from interest start date
  if (loan.loanType === 'student' && loan.isSubsidized) {
    const gracePeriodEnd = new Date(loan.interestStartDate);
    gracePeriodEnd.setMonth(
      gracePeriodEnd.getMonth() + (loan.gracePeriodMonths || 6)
    );

    if (startDate < gracePeriodEnd) {
      return false;
    }
  }

  // For all other cases (including unsubsidized student loans), interest accrues
  return true;
}

/**
 * Calculates interest for different loan types based on their specific rules
 */
export function calculateInterestForLoanType(
  context: InterestCalculationContext
): InterestCalculationResult {
  const { loan, paymentDate, lastPaymentDate, currentBalance } = context;

  // Determine the effective start date for interest calculation
  const effectiveStartDate = new Date(
    Math.max(lastPaymentDate.getTime(), loan.interestStartDate.getTime())
  );

  // Check if interest should accrue for this period
  if (!shouldAccrueInterest(loan, effectiveStartDate, paymentDate)) {
    // No interest accrues, entire payment goes to principal
    return {
      interestOwed: 0,
      principalPayment:
        context.paymentDate === paymentDate ? currentBalance : 0,
      newBalance: Math.max(
        0,
        currentBalance -
          (context.paymentDate === paymentDate ? currentBalance : 0)
      ),
      interestPaid: 0,
    };
  }

  // Calculate interest based on accrual method
  let interestOwed = 0;

  if (loan.interestAccrualMethod === 'daily') {
    // Daily interest calculation
    const days = Math.ceil(
      (paymentDate.getTime() - effectiveStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const dailyRate = loan.interestRate / 100 / 365.25;
    interestOwed = currentBalance * dailyRate * days;
  } else {
    // Monthly interest calculation
    const startYear = effectiveStartDate.getFullYear();
    const startMonth = effectiveStartDate.getMonth();
    const endYear = paymentDate.getFullYear();
    const endMonth = paymentDate.getMonth();

    const months = (endYear - startYear) * 12 + (endMonth - startMonth);
    const monthlyRate = loan.interestRate / 100 / 12;
    interestOwed = currentBalance * monthlyRate * months;
  }

  return {
    interestOwed,
    principalPayment: 0, // Will be calculated by caller
    newBalance: currentBalance, // Will be calculated by caller
    interestPaid: 0, // Will be calculated by caller
  };
}

/**
 * Applies a payment to a loan following loan type-specific rules
 */
export function applyPaymentWithLoanTypeRules(
  context: InterestCalculationContext,
  paymentAmount: number
): InterestCalculationResult {
  const { loan, currentBalance, paymentDate } = context;

  // Check if this payment is late
  const isLate = isPaymentLate(loan, paymentDate);
  const daysLate = isLate ? getDaysLate(loan, paymentDate) : 0;

  // Get interest calculation
  const interestCalc = calculateInterestForLoanType(context);

  // For late payments, we need to calculate additional interest from the due date to the payment date
  let additionalLateInterest = 0;
  if (isLate && daysLate > 0) {
    // Calculate additional interest for the late period
    if (loan.interestAccrualMethod === 'daily') {
      const dailyRate = loan.interestRate / 100 / 365.25;
      additionalLateInterest = currentBalance * dailyRate * daysLate;
    } else {
      // For monthly interest, calculate based on partial months
      const monthlyRate = loan.interestRate / 100 / 12;
      const partialMonths = daysLate / 30.44; // Average days per month
      additionalLateInterest = currentBalance * monthlyRate * partialMonths;
    }
  }

  // Total interest owed includes both regular interest and late interest
  const totalInterestOwed = interestCalc.interestOwed + additionalLateInterest;

  // Apply payment: interest first, then principal
  const interestPaid = Math.min(paymentAmount, totalInterestOwed);
  const principalPayment = Math.max(0, paymentAmount - interestPaid);
  const newBalance = Math.max(0, currentBalance - principalPayment);

  return {
    interestOwed: totalInterestOwed,
    principalPayment,
    newBalance,
    interestPaid,
  };
}

/**
 * Gets the appropriate interest start date for a loan type
 */
export function getInterestStartDate(loan: Loan): Date {
  switch (loan.loanType) {
    case 'student':
      if (loan.isSubsidized) {
        // For subsidized loans, interest starts after grace period
        const gracePeriodEnd = new Date(loan.interestStartDate);
        gracePeriodEnd.setMonth(
          gracePeriodEnd.getMonth() + (loan.gracePeriodMonths || 6)
        );
        return gracePeriodEnd;
      } else {
        // For unsubsidized loans, interest starts immediately
        return loan.interestStartDate;
      }

    case 'credit_card':
      // Credit cards typically start accruing interest immediately
      return loan.interestStartDate;

    case 'mortgage':
    case 'auto':
    case 'personal':
      // Traditional loans start accruing interest from disbursement
      return loan.interestStartDate;

    default:
      return loan.interestStartDate;
  }
}

/**
 * Gets the first payment due date for a loan type
 */
export function getFirstPaymentDueDate(loan: Loan): Date {
  switch (loan.loanType) {
    case 'student':
      // Student loans typically have a grace period before first payment
      const gracePeriodEnd = new Date(loan.interestStartDate);
      gracePeriodEnd.setMonth(
        gracePeriodEnd.getMonth() + (loan.gracePeriodMonths || 6)
      );
      return gracePeriodEnd;

    case 'credit_card':
      // Credit cards typically have a grace period for purchases
      const creditGracePeriod = new Date(loan.disbursementDate);
      creditGracePeriod.setMonth(creditGracePeriod.getMonth() + 1);
      return creditGracePeriod;

    case 'mortgage':
    case 'auto':
    case 'personal':
      // Traditional loans typically start payments 1 month after disbursement
      const firstPayment = new Date(loan.disbursementDate);
      firstPayment.setMonth(firstPayment.getMonth() + 1);
      return firstPayment;

    default:
      return loan.firstPaymentDueDate;
  }
}

/**
 * Determines if a payment made before the first due date should have interest calculated
 */
export function shouldCalculateInterestForEarlyPayment(
  loan: Loan,
  paymentDate: Date
): boolean {
  // If payment is before interest start date, no interest
  if (paymentDate < loan.interestStartDate) {
    return false;
  }

  // For subsidized student loans, check grace period
  if (loan.loanType === 'student' && loan.isSubsidized) {
    const gracePeriodEnd = new Date(loan.interestStartDate);
    gracePeriodEnd.setMonth(
      gracePeriodEnd.getMonth() + (loan.gracePeriodMonths || 6)
    );

    if (paymentDate < gracePeriodEnd) {
      return false;
    }
  }

  // For all other cases, calculate interest from interest start date
  return true;
}

/**
 * Calculates the next payment due date based on the loan's payment frequency and due day
 */
export function getNextPaymentDueDate(
  loan: Loan,
  fromDate: Date = new Date()
): Date {
  const dueDay = loan.paymentDueDay || 1;
  const currentDate = new Date(fromDate);

  // Start with the first payment due date
  let nextDueDate = new Date(loan.firstPaymentDueDate);

  // If the current date is before the first payment due date, return the first due date
  if (currentDate < nextDueDate) {
    return nextDueDate;
  }

  // Calculate how many payment periods have passed since the first payment due date
  const monthsSinceFirstPayment =
    (currentDate.getFullYear() - nextDueDate.getFullYear()) * 12 +
    (currentDate.getMonth() - nextDueDate.getMonth());

  // Calculate the next due date
  nextDueDate = new Date(loan.firstPaymentDueDate);
  nextDueDate.setMonth(nextDueDate.getMonth() + monthsSinceFirstPayment + 1);
  nextDueDate.setDate(dueDay);

  return nextDueDate;
}

/**
 * Calculates the previous payment due date based on the loan's payment frequency and due day
 */
export function getPreviousPaymentDueDate(
  loan: Loan,
  fromDate: Date = new Date()
): Date {
  const dueDay = loan.paymentDueDay || 1;
  const currentDate = new Date(fromDate);

  // Start with the first payment due date
  let previousDueDate = new Date(loan.firstPaymentDueDate);

  // If the current date is before the first payment due date, return the first due date
  if (currentDate < previousDueDate) {
    return previousDueDate;
  }

  // Calculate how many payment periods have passed since the first payment due date
  const monthsSinceFirstPayment =
    (currentDate.getFullYear() - previousDueDate.getFullYear()) * 12 +
    (currentDate.getMonth() - previousDueDate.getMonth());

  // Calculate the previous due date
  previousDueDate = new Date(loan.firstPaymentDueDate);
  previousDueDate.setMonth(
    previousDueDate.getMonth() + monthsSinceFirstPayment
  );
  previousDueDate.setDate(dueDay);

  return previousDueDate;
}

/**
 * Determines if a payment is late based on the loan's payment due day
 */
export function isPaymentLate(loan: Loan, paymentDate: Date): boolean {
  const payment = new Date(paymentDate);

  // Get the expected due date for this payment
  const expectedDueDate = getPreviousPaymentDueDate(loan, payment);

  // If payment is made after the due date, it's late
  return payment > expectedDueDate;
}

/**
 * Calculates the number of days a payment is late
 */
export function getDaysLate(loan: Loan, paymentDate: Date): number {
  const payment = new Date(paymentDate);

  // Get the expected due date for this payment
  const expectedDueDate = getPreviousPaymentDueDate(loan, payment);

  // Calculate days difference
  const timeDiff = payment.getTime() - expectedDueDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return Math.max(0, daysDiff);
}

/**
 * Detects missed payments between the last payment date and the current date
 */
export function getMissedPayments(
  loan: Loan,
  lastPaymentDate: Date,
  currentDate: Date = new Date()
): Array<{ dueDate: Date; daysOverdue: number }> {
  const missedPayments: Array<{ dueDate: Date; daysOverdue: number }> = [];
  const dueDay = loan.paymentDueDay || 1;

  // Start from the month after the last payment
  let checkDate = new Date(lastPaymentDate);
  checkDate.setMonth(checkDate.getMonth() + 1);
  checkDate.setDate(dueDay);

  // Check each month until we reach the current date
  while (checkDate < currentDate) {
    // If this due date has passed and no payment was made, it's missed
    if (checkDate < currentDate) {
      const daysOverdue = Math.ceil(
        (currentDate.getTime() - checkDate.getTime()) / (1000 * 3600 * 24)
      );
      missedPayments.push({
        dueDate: new Date(checkDate),
        daysOverdue,
      });
    }

    // Move to next month
    checkDate.setMonth(checkDate.getMonth() + 1);
  }

  return missedPayments;
}

/**
 * Calculates the total interest that would accrue on missed payments
 */
export function calculateMissedPaymentInterest(
  loan: Loan,
  missedPayments: Array<{ dueDate: Date; daysOverdue: number }>,
  currentBalance: number
): number {
  let totalMissedInterest = 0;

  for (const missedPayment of missedPayments) {
    const daysOverdue = missedPayment.daysOverdue;

    if (loan.interestAccrualMethod === 'daily') {
      const dailyRate = loan.interestRate / 100 / 365.25;
      totalMissedInterest += currentBalance * dailyRate * daysOverdue;
    } else {
      const monthlyRate = loan.interestRate / 100 / 12;
      const partialMonths = daysOverdue / 30.44; // Average days per month
      totalMissedInterest += currentBalance * monthlyRate * partialMonths;
    }
  }

  return totalMissedInterest;
}

/**
 * Gets loan type-specific default values
 */
export function getLoanTypeDefaults(loanType: LoanType) {
  const defaults = {
    student: {
      interestAccrualMethod: 'daily' as InterestAccrualMethod,
      gracePeriodMonths: 6,
      isSubsidized: false,
    },
    credit_card: {
      interestAccrualMethod: 'daily' as InterestAccrualMethod,
      gracePeriodMonths: 1,
      isSubsidized: false,
    },
    mortgage: {
      interestAccrualMethod: 'monthly' as InterestAccrualMethod,
      gracePeriodMonths: 1,
      isSubsidized: false,
    },
    auto: {
      interestAccrualMethod: 'monthly' as InterestAccrualMethod,
      gracePeriodMonths: 1,
      isSubsidized: false,
    },
    personal: {
      interestAccrualMethod: 'monthly' as InterestAccrualMethod,
      gracePeriodMonths: 1,
      isSubsidized: false,
    },
    business: {
      interestAccrualMethod: 'monthly' as InterestAccrualMethod,
      gracePeriodMonths: 1,
      isSubsidized: false,
    },
    home_equity: {
      interestAccrualMethod: 'monthly' as InterestAccrualMethod,
      gracePeriodMonths: 1,
      isSubsidized: false,
    },
  };

  return defaults[loanType] || defaults.personal;
}
