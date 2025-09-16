import React, { useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import { Loan } from '../../types';
import { AddPaymentModal } from '../forms';
import {
    LoanVisualizerHeader,
    LoanOverviewCards,
    PaymentStatisticsCards,
    LoanDetailsCard
} from './index';
import { BalanceChart, PieChart, OneTimePaymentChart } from '../charts';
import { useAppSelector } from '../../hooks/redux';
import { getPaymentsForLoan } from '../../utils/dataUtils';

interface LoanVisualizerProps {
    loan: Loan;
    onBack: () => void;
}

export const LoanVisualizer: React.FC<LoanVisualizerProps> = ({ loan, onBack }) => {
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const { payments } = useAppSelector((state) => state.payments);
    const loanPayments = getPaymentsForLoan(payments, loan.id);

    const handleAddPayment = () => {
        setPaymentModalVisible(true);
    };

    const handlePaymentModalCancel = () => {
        setPaymentModalVisible(false);
    };

    // Calculate loan details
    const loanDetails = useMemo(() => {
        const monthlyRate = loan.interestRate / 100 / 12;
        const totalPayments = loan.termMonths || 360; // Default to 30 years if no term

        let monthlyPayment = 0;
        let totalInterest = 0;

        if (loan.minimumPayment) {
            monthlyPayment = loan.minimumPayment;
            // Calculate estimated total interest for minimum payment loans
            let balance = loan.principal;
            let monthsToPayoff = 0;
            const maxMonths = 300; // Cap at 25 years for calculation

            while (balance > 0 && monthsToPayoff < maxMonths) {
                const interestPayment = balance * monthlyRate;
                const principalPayment = Math.max(0, monthlyPayment - interestPayment);
                balance = Math.max(0, balance - principalPayment);
                totalInterest += interestPayment;
                monthsToPayoff++;
            }

            if (monthsToPayoff >= maxMonths) {
                totalInterest = loan.principal * monthlyRate * maxMonths;
            }
        } else if (loan.termMonths > 0) {
            // Standard loan calculation
            monthlyPayment = (loan.principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                (Math.pow(1 + monthlyRate, totalPayments) - 1);
            totalInterest = (monthlyPayment * totalPayments) - loan.principal;
        }

        const totalAmount = loan.principal + totalInterest;

        return {
            monthlyPayment,
            totalInterest,
            totalAmount,
        };
    }, [loan]);

    // Generate payment schedule data
    const paymentScheduleData = useMemo(() => {
        const data = [];
        const monthlyRate = loan.interestRate / 100 / 12;
        let balance = loan.principal;
        const maxMonths = loan.termMonths > 0 ? loan.termMonths : 120; // Cap at 10 years for minimum payment loans

        for (let month = 0; month <= maxMonths; month++) {
            if (month === 0) {
                data.push({
                    month,
                    balance: loan.principal,
                    actualPayment: null,
                });
                continue;
            }

            // Calculate projected balance
            if (loan.minimumPayment) {
                const interestPayment = balance * monthlyRate;
                const principalPayment = Math.max(0, loan.minimumPayment - interestPayment);
                balance = Math.max(0, balance - principalPayment);
            } else if (loan.termMonths > 0) {
                const interestPayment = balance * monthlyRate;
                const principalPayment = loanDetails.monthlyPayment - interestPayment;
                balance = Math.max(0, balance - principalPayment);
            }

            // Check for actual payments in this month
            const monthPayments = loanPayments.filter(payment => {
                const paymentDate = new Date(payment.paymentDate);
                const loanStartDate = new Date(loan.startDate);
                const monthsDiff = (paymentDate.getFullYear() - loanStartDate.getFullYear()) * 12 +
                    (paymentDate.getMonth() - loanStartDate.getMonth());
                return monthsDiff === month;
            });

            const actualPayment = monthPayments.length > 0 ?
                monthPayments.reduce((sum, payment) => sum + payment.amount, 0) : null;

            data.push({
                month,
                balance,
                actualPayment,
            });

            if (balance <= 0) break;
        }

        return data;
    }, [loan, loanDetails, loanPayments]);

    // Prepare chart data
    const totalCostData = [
        { name: 'Principal', value: loan.principal, color: '#1890ff' },
        { name: 'Total Interest', value: Math.max(loanDetails.totalInterest, 1), color: '#ff4d4f' },
    ];

    return (
        <div className="loan-visualizer">
            <LoanVisualizerHeader
                loanName={loan.name}
                onBack={onBack}
                onAddPayment={handleAddPayment}
            />

            <div className="visualizer-content">
                <LoanOverviewCards loan={loan} loanDetails={loanDetails} />

                <PaymentStatisticsCards
                    loanPayments={loanPayments}
                    loan={loan}
                    loanDetails={loanDetails}
                />

                <Row gutter={[16, 16]} className="charts-section">
                    <Col xs={24}>
                        <BalanceChart
                            paymentScheduleData={paymentScheduleData}
                            loanPayments={loanPayments}
                            loan={loan}
                        />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="charts-section">
                    <Col xs={24} sm={12}>
                        <PieChart
                            title="Total Loan Cost"
                            tooltip="Shows the breakdown of your total loan cost between principal and interest"
                            data={totalCostData}
                        />
                    </Col>
                    <Col xs={24} sm={12}>
                        <OneTimePaymentChart
                            monthlyPayment={loanDetails.monthlyPayment}
                            principal={loan.principal}
                            interestRate={loan.interestRate}
                        />
                    </Col>
                </Row>

                <LoanDetailsCard loan={loan} loanDetails={loanDetails} />
            </div>

            <AddPaymentModal
                visible={paymentModalVisible}
                onCancel={handlePaymentModalCancel}
                preselectedLoanId={loan.id}
            />
        </div>
    );
};
