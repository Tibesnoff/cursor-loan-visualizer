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
                        <span>{loan.paymentFrequency.charAt(0).toUpperCase() + loan.paymentFrequency.slice(1)}</span>
                    </div>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <div className="detail-item">
                        <strong>Start Date: </strong>
                        <span>{dayjs(loan.startDate).format('MMMM D, YYYY')}</span>
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
                        <strong>Created: </strong>
                        <span>{dayjs(loan.createdAt).format('MMMM DD, YYYY')}</span>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};
