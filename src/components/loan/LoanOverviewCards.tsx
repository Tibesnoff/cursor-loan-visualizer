import React from 'react';
import { Row, Col, Card, Statistic, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface LoanOverviewCardsProps {
    loan: {
        principal: number;
        interestRate: number;
        minimumPayment?: number;
    };
    loanDetails: {
        monthlyPayment: number;
    };
    actualLoanStats: {
        remainingBalance: number;
    };
}

export const LoanOverviewCards: React.FC<LoanOverviewCardsProps> = ({
    loan,
    loanDetails,
    actualLoanStats
}) => {
    return (
        <Row gutter={[16, 16]} className="overview-cards">
            {/* Loan Overview Card */}
            <Col xs={24}>
                <Card className="grouped-card">
                    <div className="card-header">
                        <h3 className="card-title">Loan Overview</h3>
                    </div>
                    <Row gutter={[16, 16]}>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        Principal Amount
                                        <Tooltip title="The original amount you borrowed (starting balance)">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={loan.principal}
                                prefix="$"
                                valueStyle={{ color: '#1890ff' }}
                                formatter={(value) => Number(value).toLocaleString()}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        Remaining Balance
                                        <Tooltip title="Current balance remaining on the loan after all payments made">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={actualLoanStats.remainingBalance}
                                prefix="$"
                                valueStyle={{ color: '#ff4d4f' }}
                                formatter={(value) => Number(value).toLocaleString()}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        Interest Rate
                                        <Tooltip title="Annual percentage rate charged on your loan">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={loan.interestRate}
                                suffix="%"
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Statistic
                                title={
                                    <span>
                                        {loan.minimumPayment ? 'Minimum Payment' : 'Monthly Payment'}
                                        <Tooltip title={loan.minimumPayment ? 'Minimum amount you must pay each month' : 'Fixed monthly payment amount'}>
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={loanDetails.monthlyPayment}
                                prefix="$"
                                valueStyle={{ color: '#fa8c16' }}
                                formatter={(value) => Number(value).toLocaleString()}
                            />
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};
