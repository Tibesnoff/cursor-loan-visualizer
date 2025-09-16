import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Tooltip } from 'antd';
import { ArrowLeftOutlined, QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loan } from '../types';
import { AddPaymentModal } from './AddPaymentModal';
import { useAppSelector } from '../hooks/redux';
import { getPaymentsForLoan } from '../utils/dataUtils';
import dayjs from 'dayjs';

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
            // This is an approximation based on how long it would take to pay off with minimum payments
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

            // If it would take more than 25 years, estimate based on interest-only payments
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

        // Calculate actual remaining balance from payments
        let remainingBalance = loan.principal;
        if (loanPayments.length > 0) {
            const sortedPayments = loanPayments.sort(
                (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
            );
            remainingBalance = sortedPayments[0].remainingBalance;
        }

        return {
            monthlyPayment: Math.round(monthlyPayment),
            totalInterest: Math.round(totalInterest),
            totalAmount: Math.round(totalAmount),
            remainingBalance: Math.round(remainingBalance),
            totalPayments,
        };
    }, [loan, loanPayments]);

    // Generate payment schedule data for charts (including actual payments)
    const paymentScheduleData = useMemo(() => {
        const data = [];
        const monthlyRate = loan.interestRate / 100 / 12;
        let balance = loan.principal;
        const monthlyPayment = loanDetails.monthlyPayment;

        // Sort payments by date
        const sortedPayments = loanPayments.sort(
            (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
        );

        // Create a map of payments by month (months since loan start)
        const paymentsByMonth = new Map();
        sortedPayments.forEach(payment => {
            const monthsSinceStart = Math.floor(
                (new Date(payment.paymentDate).getTime() - new Date(loan.startDate).getTime()) /
                (1000 * 60 * 60 * 24 * 30.44) // Average days per month
            );
            paymentsByMonth.set(monthsSinceStart, payment);
        });

        // For minimum payment loans, show up to 10 years (120 months)
        // For fixed-term loans, show the full term or max 5 years
        const maxMonths = loan.minimumPayment ? 120 : Math.min(loan.termMonths, 60);

        for (let month = 0; month <= maxMonths; month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = Math.min(monthlyPayment - interestPayment, balance);

            // Check if there's an actual payment for this month
            const actualPayment = paymentsByMonth.get(month);
            const hasActualPayment = actualPayment !== undefined;

            data.push({
                month: month,
                balance: Math.round(balance),
                interest: Math.round(interestPayment),
                principal: Math.round(principalPayment),
                actualPayment: hasActualPayment ? actualPayment.amount : 0,
                actualPrincipal: hasActualPayment ? actualPayment.principalAmount : 0,
                actualInterest: hasActualPayment ? actualPayment.interestAmount : 0,
                isActualPayment: hasActualPayment,
            });

            if (month < maxMonths) {
                // Use actual payment data if available, otherwise use calculated
                if (hasActualPayment) {
                    balance = actualPayment.remainingBalance;
                } else {
                    balance = Math.max(0, balance - principalPayment);
                }

                // For minimum payment loans, if balance is paid off, stop
                if (loan.minimumPayment && balance <= 0) {
                    break;
                }
            }
        }

        return data;
    }, [loan, loanDetails, loanPayments]);

    // Pie chart data for total loan cost
    const totalCostData = [
        { name: 'Principal', value: loan.principal, color: '#1890ff' },
        { name: 'Total Interest', value: Math.max(loanDetails.totalInterest, 1), color: '#ff4d4f' },
    ];

    const getLoanTypeColor = (loanType: string) => {
        const colors: { [key: string]: string } = {
            personal: 'blue',
            auto: 'green',
            mortgage: 'purple',
            student: 'orange',
            credit_card: 'red',
            business: 'cyan',
            home_equity: 'magenta',
        };
        return colors[loanType] || 'default';
    };

    const getLoanTypeLabel = (loanType: string) => {
        const labels: { [key: string]: string } = {
            personal: 'Personal Loan',
            auto: 'Auto Loan',
            mortgage: 'Mortgage',
            student: 'Student Loan',
            credit_card: 'Credit Card',
            business: 'Business Loan',
            home_equity: 'Home Equity Loan',
        };
        return labels[loanType] || loanType;
    };

    return (
        <div className="loan-visualizer">
            <div className="visualizer-header">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    className="back-button"
                >
                    Back to Loans
                </Button>
                <h1 className="visualizer-title">{loan.name}</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddPayment}
                    className="add-payment-button"
                >
                    Add Payment
                </Button>
            </div>

            <div className="visualizer-content">
                {/* Loan Overview Cards */}
                <Row gutter={[16, 16]} className="overview-cards">
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card">
                            <Statistic
                                title={
                                    <span>
                                        Principal Amount
                                        <Tooltip title="The original amount you borrowed">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={loan.principal}
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
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card">
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
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card className="stat-card">
                            <Statistic
                                title={
                                    <span>
                                        Total Interest
                                        <Tooltip title="Total interest you'll pay over the life of the loan">
                                            <QuestionCircleOutlined className="field-tooltip-icon" />
                                        </Tooltip>
                                    </span>
                                }
                                value={loanDetails.totalInterest}
                                prefix="$"
                                valueStyle={{ color: '#f5222d' }}
                                formatter={(value) => Number(value).toLocaleString()}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Payment Statistics */}
                {loanPayments.length > 0 && (
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
                )}

                {/* Enhanced Balance Over Time Chart */}
                <Row gutter={[16, 16]} className="charts-section">
                    <Col xs={24}>
                        <Card
                            title={
                                <span>
                                    {loan.minimumPayment ? 'Loan Balance & Payment Progress' : 'Payment Schedule & Balance'}
                                    <Tooltip title={loan.minimumPayment ?
                                        "Shows your loan balance over time (blue line) and actual payments made (green dashed line)." :
                                        "Shows your loan balance over time (blue line) and actual payments made (green dashed line)."
                                    }>
                                        <QuestionCircleOutlined className="field-tooltip-icon" />
                                    </Tooltip>
                                </span>
                            }
                            className="chart-card"
                        >
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={paymentScheduleData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        label={{ value: 'Months Since Loan Start', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis
                                        yAxisId="balance"
                                        label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
                                        tickFormatter={(value) => {
                                            if (value >= 1000000) {
                                                return `$${(value / 1000000).toFixed(1)}M`;
                                            } else if (value >= 1000) {
                                                return `$${(value / 1000).toFixed(0)}k`;
                                            } else {
                                                return `$${value}`;
                                            }
                                        }}
                                    />
                                    <YAxis
                                        yAxisId="payments"
                                        orientation="right"
                                        label={{ value: 'Payment Amount ($)', angle: 90, position: 'insideRight' }}
                                        tickFormatter={(value) => {
                                            if (value >= 1000000) {
                                                return `$${(value / 1000000).toFixed(1)}M`;
                                            } else if (value >= 1000) {
                                                return `$${(value / 1000).toFixed(0)}k`;
                                            } else {
                                                return `$${value}`;
                                            }
                                        }}
                                    />
                                    <RechartsTooltip
                                        formatter={(value, name) => [
                                            `$${Number(value).toLocaleString()}`,
                                            name === 'balance' ? 'Remaining Balance' :
                                                name === 'actualPayment' ? 'Actual Payment Made' : 'Unknown'
                                        ]}
                                        labelFormatter={(month) => `Month ${month}`}
                                    />
                                    <Legend />

                                    {/* Balance line */}
                                    <Line
                                        yAxisId="balance"
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#1890ff"
                                        strokeWidth={3}
                                        name="Remaining Balance"
                                        dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                                    />

                                    {/* Actual payments */}
                                    {loanPayments.length > 0 && (
                                        <Line
                                            yAxisId="payments"
                                            type="monotone"
                                            dataKey="actualPayment"
                                            stroke="#52c41a"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            name="Actual Payments"
                                            dot={{ fill: '#52c41a', strokeWidth: 2, r: 3 }}
                                            connectNulls={false}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col xs={24} lg={6}>
                        <Card
                            title={
                                <span>
                                    Total Loan Cost
                                    <Tooltip title={loan.minimumPayment ?
                                        "Shows total loan cost: principal amount vs total interest paid over loan life" :
                                        "Shows total loan cost: principal amount vs total interest paid over loan life"
                                    }>
                                        <QuestionCircleOutlined className="field-tooltip-icon" />
                                    </Tooltip>
                                </span>
                            }
                            className="chart-card"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={totalCostData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {totalCostData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value, entry: any) => {
                                            const total = totalCostData.reduce((sum, item) => sum + item.value, 0);
                                            const percentage = ((entry.payload.value / total) * 100).toFixed(0);
                                            return (
                                                <span style={{ color: entry.color }}>
                                                    {value} ({percentage}%)
                                                </span>
                                            );
                                        }}
                                    />
                                    <RechartsTooltip
                                        formatter={(value, name) => [
                                            `$${Number(value).toLocaleString()}`,
                                            name === 'Principal' ? 'Principal Amount' : 'Total Interest Over Loan Life'
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col xs={24} lg={6}>
                        <Card
                            title={
                                <span>
                                    One Time Payment
                                    <Tooltip title="Shows how a single payment is split between interest and principal">
                                        <QuestionCircleOutlined className="field-tooltip-icon" />
                                    </Tooltip>
                                </span>
                            }
                            className="chart-card"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            {
                                                name: 'To Principal',
                                                value: Math.max(0, loanDetails.monthlyPayment - (loan.principal * loan.interestRate / 100 / 12)),
                                                color: '#52c41a'
                                            },
                                            {
                                                name: 'To Interest',
                                                value: Math.max(loan.principal * loan.interestRate / 100 / 12, 0.01),
                                                color: '#fa8c16'
                                            },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {[
                                            { name: 'To Principal', value: Math.max(0, loanDetails.monthlyPayment - (loan.principal * loan.interestRate / 100 / 12)), color: '#52c41a' },
                                            { name: 'To Interest', value: Math.max(loan.principal * loan.interestRate / 100 / 12, 0.01), color: '#fa8c16' },
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value, entry: any) => {
                                            const paymentData = [
                                                { name: 'To Principal', value: Math.max(0, loanDetails.monthlyPayment - (loan.principal * loan.interestRate / 100 / 12)) },
                                                { name: 'To Interest', value: Math.max(loan.principal * loan.interestRate / 100 / 12, 0.01) }
                                            ];
                                            const total = paymentData.reduce((sum, item) => sum + item.value, 0);
                                            const percentage = ((entry.payload.value / total) * 100).toFixed(0);
                                            return (
                                                <span style={{ color: entry.color }}>
                                                    {value} ({percentage}%)
                                                </span>
                                            );
                                        }}
                                    />
                                    <RechartsTooltip
                                        formatter={(value, name) => [
                                            `$${Number(value).toFixed(2)}`,
                                            name === 'To Principal' ? 'Goes to Principal' : 'Goes to Interest'
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>


                {/* Loan Details */}
                <Card title="Loan Details" className="details-card">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <div className="detail-item">
                                <strong>Loan Type:</strong>
                                <span className={`loan-type-badge ${getLoanTypeColor(loan.loanType)}`}>
                                    {getLoanTypeLabel(loan.loanType)}
                                </span>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="detail-item">
                                <strong>Term:</strong>
                                <span>{loan.termMonths === 0 ? 'No fixed term' : `${loan.termMonths} months (${Math.round(loan.termMonths / 12)} years)`}</span>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="detail-item">
                                <strong>Payment Frequency:</strong>
                                <span>{loan.paymentFrequency.charAt(0).toUpperCase() + loan.paymentFrequency.slice(1)}</span>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="detail-item">
                                <strong>Start Date:</strong>
                                <span>{dayjs(loan.startDate).format('MMMM DD, YYYY')}</span>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="detail-item">
                                <strong>Total Amount:</strong>
                                <span>${loanDetails.totalAmount.toLocaleString()}</span>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="detail-item">
                                <strong>Created:</strong>
                                <span>{dayjs(loan.createdAt).format('MMMM DD, YYYY')}</span>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>

            <AddPaymentModal
                visible={paymentModalVisible}
                onCancel={handlePaymentModalCancel}
                preselectedLoanId={loan.id}
            />
        </div>
    );
};
