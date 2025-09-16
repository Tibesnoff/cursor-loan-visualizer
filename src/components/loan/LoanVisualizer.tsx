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
import { usePaymentSchedule, useActualLoanStats, useChartData } from '../../hooks';
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

    // Use hooks for calculations
    const actualLoanStats = useActualLoanStats(loan, loanPayments);
    const paymentScheduleData = usePaymentSchedule(loan, loanPayments);

    // Use chart data hook
    const { totalCostData, oneTimePaymentData } = useChartData({
        loan,
        actualLoanStats
    });

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
