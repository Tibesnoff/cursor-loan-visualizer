import React, { useMemo, useState } from 'react';
import { Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Loan } from '../../types';
import { AddPaymentModal } from '../forms';
import {
    LoanVisualizerHeader,
    LoanOverviewCards,
    PaymentStatisticsCards,
    LoanDetailsCard
} from './index';
import { BalanceChart, PieChart, OneTimePaymentChart } from '../charts';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { usePaymentSchedule, useChartData, useLoanCalculations } from '../../hooks';
import { getPaymentsForLoan } from '../../utils/dataUtils';
import { deleteLoan } from '../../store/slices/loansSlice';

interface LoanVisualizerProps {
    loan: Loan;
    onBack: () => void;
}

export const LoanVisualizer: React.FC<LoanVisualizerProps> = ({ loan, onBack }) => {
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const { payments } = useAppSelector((state) => state.payments);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const loanPayments = getPaymentsForLoan(payments, loan.id);

    const handleAddPayment = () => {
        setPaymentModalVisible(true);
    };

    const handlePaymentModalCancel = () => {
        setPaymentModalVisible(false);
    };

    const handleDeleteLoan = () => {
        dispatch(deleteLoan(loan.id));
        message.success('Loan deleted successfully');
        navigate('/loans');
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

    // Use consolidated hook for calculations
    const { actualLoanStats } = useLoanCalculations(loan, loanPayments);
    const paymentScheduleData = usePaymentSchedule(loan, loanPayments);

    // Use chart data hook
    const { totalCostData, totalCost } = useChartData({
        loan,
        loanPayments
    });

    return (
        <div className="loan-visualizer">
            <LoanVisualizerHeader
                loanName={loan.name}
                onBack={onBack}
                onAddPayment={handleAddPayment}
                onDelete={handleDeleteLoan}
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
                            loan={loan}
                            loanPayments={loanPayments}
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
                                totalCost={totalCost}
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
