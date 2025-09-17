import React from 'react';
import { Card, Row, Col } from 'antd';
import { LoanTypeBadge } from '../ui';
import { Loan } from '../../types';
import dayjs from 'dayjs';

interface LoanDetailsCardProps {
    loan: Loan;
    loanDetails: {
        monthlyPayment: number;
    };
}

export const LoanDetailsCard: React.FC<LoanDetailsCardProps> = ({
    loan,
    loanDetails
}) => {
    return (
        <Card title="Loan Details" className="details-card">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Loan Type: </strong>
                        <LoanTypeBadge loanType={loan.loanType} />
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Term: </strong>
                        <span>{loan.termMonths === 0 ? 'No fixed term' : `${loan.termMonths} months (${Math.round(loan.termMonths / 12)} years)`}</span>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Payment Frequency: </strong>
                        <span>{loan.paymentFrequency ? loan.paymentFrequency.charAt(0).toUpperCase() + loan.paymentFrequency.slice(1) : 'Monthly'}</span>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Disbursement Date: </strong>
                        <span>{dayjs(loan.disbursementDate).format('MMMM D, YYYY')}</span>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Interest Start Date: </strong>
                        <span>{dayjs(loan.interestStartDate).format('MMMM D, YYYY')}</span>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>First Payment Due: </strong>
                        <span>{dayjs(loan.firstPaymentDueDate).format('MMMM D, YYYY')}</span>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Monthly Payment: </strong>
                        <span>${loanDetails.monthlyPayment.toLocaleString()}</span>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Interest Accrual: </strong>
                        <span>{loan.interestAccrualMethod === 'daily' ? 'Daily (Student Loans)' : 'Monthly (Traditional)'}</span>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Created: </strong>
                        <span>{dayjs(loan.createdAt).format('MMMM DD, YYYY')}</span>
                    </div>
                </Col>
                {loan.loanType === 'student' && (
                    <>
                        <Col xs={24} sm={12} md={8}>
                            <div className="detail-item">
                                <strong>Subsidized: </strong>
                                <span>{loan.isSubsidized ? 'Yes' : 'No'}</span>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="detail-item">
                                <strong>Grace Period: </strong>
                                <span>{loan.gracePeriodMonths || 0} months</span>
                            </div>
                        </Col>
                    </>
                )}
            </Row>
        </Card>
    );
};
