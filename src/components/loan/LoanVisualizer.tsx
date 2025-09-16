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

        if (loan.minimumPayment) {
            monthlyPayment = loan.minimumPayment;
        } else if (loan.termMonths > 0) {
            // Standard loan calculation
            monthlyPayment = (loan.principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                (Math.pow(1 + monthlyRate, totalPayments) - 1);
        }

        return {
            monthlyPayment,
        };
    }, [loan]);

    // Calculate actual loan statistics based on payments made
    const actualLoanStats = useMemo(() => {
        const totalPaid = loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingBalance = Math.max(0, loan.principal - totalPaid);

        // Calculate interest paid (simplified - assumes payments go to interest first)
        const monthlyRate = loan.interestRate / 100 / 12;
        let interestPaid = 0;
        let balance = loan.principal;

        loanPayments.forEach(payment => {
            const interestOwed = balance * monthlyRate;
            const principalPayment = Math.max(0, payment.amount - interestOwed);
            interestPaid += Math.min(interestOwed, payment.amount);
            balance = Math.max(0, balance - principalPayment);
        });

        const principalPaid = totalPaid - interestPaid;

        return {
            totalPaid,
            principalPaid,
            interestPaid,
            remainingBalance,
        };
    }, [loan, loanPayments]);

    // Generate payment schedule data
    const paymentScheduleData = useMemo(() => {
        const data = [];
        const monthlyRate = loan.interestRate / 100 / 12;
        let projectedBalance = loan.principal;
        let actualBalance = loan.principal;
        const maxMonths = loan.termMonths > 0 ? loan.termMonths : 120; // Cap at 10 years for minimum payment loans
        const loanStartDate = new Date(loan.startDate);

        // Group payments by month for easier lookup
        const paymentsByMonth = new Map();
        loanPayments.forEach(payment => {
            const paymentDate = new Date(payment.paymentDate);
            const monthsDiff = (paymentDate.getFullYear() - loanStartDate.getFullYear()) * 12 +
                (paymentDate.getMonth() - loanStartDate.getMonth());

            if (monthsDiff >= 0) {
                if (!paymentsByMonth.has(monthsDiff)) {
                    paymentsByMonth.set(monthsDiff, []);
                }
                paymentsByMonth.get(monthsDiff).push(payment);
            }
        });

        for (let month = 0; month <= maxMonths; month++) {
            if (month === 0) {
                data.push({
                    month,
                    balance: loan.principal,
                    actualPayment: null,
                    actualBalance: loan.principal,
                    projectedBalance: loan.principal,
                });
                continue;
            }

            // Calculate projected balance (what it would be without actual payments)
            if (loan.minimumPayment) {
                const interestPayment = projectedBalance * monthlyRate;
                const principalPayment = Math.max(0, loan.minimumPayment - interestPayment);
                projectedBalance = Math.max(0, projectedBalance - principalPayment);
            } else if (loan.termMonths > 0) {
                const interestPayment = projectedBalance * monthlyRate;
                const principalPayment = loanDetails.monthlyPayment - interestPayment;
                projectedBalance = Math.max(0, projectedBalance - principalPayment);
            }

            // Get actual payments for this month
            const monthPayments = paymentsByMonth.get(month) || [];
            const actualPayment = monthPayments.length > 0 ?
                monthPayments.reduce((sum, payment) => sum + payment.amount, 0) : null;

            // Calculate actual balance (accounting for actual payments)
            if (actualPayment && actualPayment > 0) {
                // Apply actual payment to reduce balance
                const interestOwed = actualBalance * monthlyRate;
                const principalPayment = Math.max(0, actualPayment - interestOwed);
                actualBalance = Math.max(0, actualBalance - principalPayment);
            } else if (month > 0) {
                // If no actual payment, apply projected payment logic
                if (loan.minimumPayment) {
                    const interestPayment = actualBalance * monthlyRate;
                    const principalPayment = Math.max(0, loan.minimumPayment - interestPayment);
                    actualBalance = Math.max(0, actualBalance - principalPayment);
                } else if (loan.termMonths > 0) {
                    const interestPayment = actualBalance * monthlyRate;
                    const principalPayment = loanDetails.monthlyPayment - interestPayment;
                    actualBalance = Math.max(0, actualBalance - principalPayment);
                }
            }

            data.push({
                month,
                balance: actualBalance, // Use actual balance for the main line
                actualPayment,
                actualBalance,
                projectedBalance,
            });

            if (actualBalance <= 0) break;
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
                {/* Loan Overview Section */}
                <div className="section-group">
                    <h2 className="section-title">Loan Overview</h2>
                    <LoanOverviewCards
                        loan={loan}
                        loanDetails={loanDetails}
                        actualLoanStats={actualLoanStats}
                    />
                </div>

                {/* Payment Progress Section */}
                {loanPayments.length > 0 && (
                    <div className="section-group">
                        <h2 className="section-title">Payment Progress</h2>
                        <PaymentStatisticsCards
                            loanPayments={loanPayments}
                            loan={loan}
                            loanDetails={loanDetails}
                            actualLoanStats={actualLoanStats}
                        />
                    </div>
                )}

                {/* Charts Section */}
                <div className="section-group">
                    <h2 className="section-title">Visualizations</h2>
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
                </div>

                {/* Loan Details Section */}
                <div className="section-group">
                    <LoanDetailsCard loan={loan} loanDetails={loanDetails} />
                </div>
            </div>

            <AddPaymentModal
                visible={paymentModalVisible}
                onCancel={handlePaymentModalCancel}
                preselectedLoanId={loan.id}
            />
        </div>
    );
};
