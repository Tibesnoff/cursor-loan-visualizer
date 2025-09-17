import React from 'react';
import { Loan, Payment } from '../../../types';
import { getRemainingBalanceForLoan } from '../../../utils/dataUtils';

export interface LoanInfoDisplayProps {
    loan: Loan;
    payments: Payment[];
    className?: string;
}

const LoanInfoDisplay: React.FC<LoanInfoDisplayProps> = ({
    loan,
    payments,
    className = 'loan-info'
}) => {
    const remainingBalance = getRemainingBalanceForLoan(loan, payments);

    return (
        <div className={className}>
            <p><strong>Loan Type:</strong> {loan.loanType.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Interest Rate:</strong> {loan.interestRate}%</p>
            <p><strong>Current Balance:</strong> ${remainingBalance.toLocaleString()}</p>
            {loan.minimumPayment && (
                <p><strong>Minimum Payment:</strong> ${loan.minimumPayment}</p>
            )}
        </div>
    );
};

export default LoanInfoDisplay;
