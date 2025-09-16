import React from 'react';
import { Row, Col, Card, Statistic, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Payment } from '../../types';

interface PaymentStatisticsCardsProps {
    loanPayments: Payment[];
    loan: {
        minimumPayment?: number;
    };
    loanDetails: {
        monthlyPayment: number;
    };
    actualLoanStats: {
        totalPaid: number;
        principalPaid: number;
        interestPaid: number;
        remainingBalance: number;
    };
}

export const PaymentStatisticsCards: React.FC<PaymentStatisticsCardsProps> = ({
    loanPayments,
    loan,
    loanDetails,
    actualLoanStats
}) => {
    if (loanPayments.length === 0) {
        return null;
    }

    // Get the most recent payment
    const lastPayment = loanPayments.length > 0
        ? loanPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]
        : null;

    // Calculate payment breakdown for the last payment
    const getLastPaymentBreakdown = () => {
        if (!lastPayment) return null;

        // Calculate what the balance was before this payment
        const paymentsBeforeLast = loanPayments
            .filter(p => new Date(p.paymentDate) < new Date(lastPayment.paymentDate))
            .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());

        let balanceBeforePayment = loan.principal;
        const monthlyRate = loan.interestRate / 100 / 12;

        // Calculate balance up to the last payment
        paymentsBeforeLast.forEach(payment => {
            const interestOwed = balanceBeforePayment * monthlyRate;
            const principalPayment = Math.max(0, payment.amount - interestOwed);
            balanceBeforePayment = Math.max(0, balanceBeforePayment - principalPayment);
        });

        // Calculate breakdown for the last payment
        const interestOwed = balanceBeforePayment * monthlyRate;
        const principalPayment = Math.max(0, lastPayment.amount - interestOwed);
        const balanceAfterPayment = Math.max(0, balanceBeforePayment - principalPayment);

        return {
            balanceBefore: balanceBeforePayment,
            balanceAfter: balanceAfterPayment,
            interestPaid: Math.min(interestOwed, lastPayment.amount),
            principalPaid: principalPayment
        };
    };

    const lastPaymentBreakdown = getLastPaymentBreakdown();

    return (
        <Row gutter={[16, 16]} className="overview-cards">
            {/* Payment Breakdown Card */}
            <Col xs={24} sm={16}>
                <Card className="grouped-card">
                    <div className="card-header">
                        <h3 className="card-title">Payment Breakdown</h3>
                    </div>
                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        Total Paid
                                        <Tooltip title="Total amount you've actually paid on this loan.">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={actualLoanStats.totalPaid}
                                prefix="$"
                                valueStyle={{ color: '#52c41a' }}
                                formatter={(value) => Number(value).toLocaleString()}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        Principal Paid
                                        <Tooltip title="Amount of principal you've actually paid off.">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={actualLoanStats.principalPaid}
                                prefix="$"
                                valueStyle={{ color: '#1890ff' }}
                                formatter={(value) => Number(value).toLocaleString()}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        Interest Paid
                                        <Tooltip title="Total interest you've actually paid so far.">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={actualLoanStats.interestPaid}
                                prefix="$"
                                valueStyle={{ color: '#fa8c16' }}
                                formatter={(value) => Number(value).toLocaleString()}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        Additional Spent Over Minimum
                                        <Tooltip title="Total amount you've paid above the minimum/required payments.">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={loanPayments.reduce((sum, payment) => {
                                    if (payment.isExtraPayment) {
                                        const minimumAmount = loan.minimumPayment || loanDetails.monthlyPayment;
                                        return sum + (payment.amount - minimumAmount);
                                    }
                                    return sum;
                                }, 0)}
                                prefix="$"
                                valueStyle={{ color: '#722ed1' }}
                                formatter={(value) => Number(value).toLocaleString()}
                            />
                        </Col>
                    </Row>
                </Card>
            </Col>

            {/* Last Payment Card */}
            <Col xs={24} sm={8}>
                <Card className="grouped-card">
                    <div className="card-header">
                        <h3 className="card-title">Last Payment</h3>
                    </div>
                    {lastPayment && lastPaymentBreakdown ? (
                        <div className="last-payment-content">
                            <div className="last-payment-header">
                                <div className="last-payment-amount">
                                    <Statistic
                                        value={lastPayment.amount}
                                        prefix="$"
                                        valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                                        formatter={(value) => Number(value).toLocaleString()}
                                    />
                                </div>
                                <div className="last-payment-date">
                                    {new Date(lastPayment.paymentDate).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="last-payment-breakdown">
                                <div className="breakdown-row">
                                    <span className="breakdown-label">Starting Balance:</span>
                                    <span className="breakdown-value">${lastPaymentBreakdown.balanceBefore.toLocaleString()}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span className="breakdown-label">Interest Paid:</span>
                                    <span className="breakdown-value interest">${lastPaymentBreakdown.interestPaid.toLocaleString()}</span>
                                </div>
                                <div className="breakdown-row">
                                    <span className="breakdown-label">Principal Paid:</span>
                                    <span className="breakdown-value principal">${lastPaymentBreakdown.principalPaid.toLocaleString()}</span>
                                </div>
                                <div className="breakdown-row total">
                                    <span className="breakdown-label">Ending Balance:</span>
                                    <span className="breakdown-value">${lastPaymentBreakdown.balanceAfter.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-payments">
                            <p>No payments made yet</p>
                        </div>
                    )}
                </Card>
            </Col>

        </Row>
    );
};
