import React from 'react';
import { Row, Col } from 'antd';
import { StatisticCard } from '../ui';

interface LoanOverviewCardsProps {
    loan: {
        principal: number;
        interestRate: number;
        minimumPayment?: number;
    };
    loanDetails: {
        monthlyPayment: number;
        totalInterest: number;
    };
}

export const LoanOverviewCards: React.FC<LoanOverviewCardsProps> = ({
    loan,
    loanDetails
}) => {
    return (
        <Row gutter={[16, 16]} className="overview-cards">
            <Col xs={24} sm={12} md={6}>
                <StatisticCard
                    title="Principal Amount"
                    value={loan.principal}
                    prefix="$"
                    tooltip="The original amount you borrowed"
                    valueStyle={{ color: '#1890ff' }}
                    formatter={(value) => Number(value).toLocaleString()}
                />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <StatisticCard
                    title="Interest Rate"
                    value={loan.interestRate}
                    suffix="%"
                    tooltip="Annual percentage rate charged on your loan"
                    valueStyle={{ color: '#52c41a' }}
                />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <StatisticCard
                    title={loan.minimumPayment ? 'Minimum Payment' : 'Monthly Payment'}
                    value={loanDetails.monthlyPayment}
                    prefix="$"
                    tooltip={loan.minimumPayment ? 'Minimum amount you must pay each month' : 'Fixed monthly payment amount'}
                    valueStyle={{ color: '#fa8c16' }}
                    formatter={(value) => Number(value).toLocaleString()}
                />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <StatisticCard
                    title="Total Interest"
                    value={loanDetails.totalInterest}
                    prefix="$"
                    tooltip="Total interest you'll pay over the life of the loan"
                    valueStyle={{ color: '#f5222d' }}
                    formatter={(value) => Number(value).toLocaleString()}
                />
            </Col>
        </Row>
    );
};
