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
}

export const PaymentStatisticsCards: React.FC<PaymentStatisticsCardsProps> = ({
    loanPayments,
    loan,
    loanDetails
}) => {
    if (loanPayments.length === 0) {
        return null;
    }

    return (
        <Row gutter={[16, 16]} className="overview-cards">
            <Col xs={24} sm={12} md={6}>
                <Card className="stat-card">
                    <Statistic
                        title={
                            <span>
                                Total Paid
                                <Tooltip title="Total amount you've actually paid on this loan.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        value={loanPayments.reduce((sum, payment) => sum + payment.amount, 0)}
                        prefix="$"
                        valueStyle={{ color: '#52c41a' }}
                        formatter={(value) => Number(value).toLocaleString()}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="stat-card">
                    <Statistic
                        title={
                            <span>
                                Principal Paid
                                <Tooltip title="Amount of principal you've actually paid off.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        value={loanPayments.reduce((sum, payment) => sum + payment.principalAmount, 0)}
                        prefix="$"
                        valueStyle={{ color: '#1890ff' }}
                        formatter={(value) => Number(value).toLocaleString()}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="stat-card">
                    <Statistic
                        title={
                            <span>
                                Interest Paid
                                <Tooltip title="Total interest you've actually paid so far.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        value={loanPayments.reduce((sum, payment) => sum + payment.interestAmount, 0)}
                        prefix="$"
                        valueStyle={{ color: '#fa8c16' }}
                        formatter={(value) => Number(value).toLocaleString()}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card className="stat-card">
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
                </Card>
            </Col>
        </Row>
    );
};
