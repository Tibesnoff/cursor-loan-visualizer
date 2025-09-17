import React from 'react';
import { Card, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import './Charts.css';

interface PaymentScheduleDataPoint {
    month: number;
    balance: number;
    minimumPaymentBalance: number;
    startingBalance: number;
    totalPayments: number;
    scheduledPayment: number;
    paymentUsed: number;
    totalInterest: number;
    monthName: string;
    year: number;
    actualDate: string;
}

interface BalanceChartProps {
    paymentScheduleData: PaymentScheduleDataPoint[];
}

const BalanceChart: React.FC<BalanceChartProps> = ({
    paymentScheduleData
}) => {
    return (
        <Card
            title={
                <span>
                    Loan Balance Over Time
                    <Tooltip title="Shows your actual loan balance vs. what it would be with only minimum payments. Blue line = your actual progress, red dashed line = minimum payment only. Timeline starts from when payments began.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            }
            className="chart-card"
        >
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={paymentScheduleData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="month"
                        label={{ value: 'Months Since Payments Started', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                        label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <RechartsTooltip
                        formatter={(value) => {
                            return [
                                `$${Number(value).toLocaleString()}`,
                                'Ending Balance'
                            ];
                        }}
                        labelFormatter={(month) => {
                            const dataPoint = paymentScheduleData.find(d => d.month === month);
                            return dataPoint ? `${dataPoint.monthName} ${dataPoint.year}` : `Month ${month}`;
                        }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div style={{
                                        background: 'white',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '12px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                    }}>
                                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                                            {data.monthName} {data.year}
                                        </p>
                                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                            <strong>Starting Balance:</strong> ${data.startingBalance.toLocaleString()}
                                        </p>
                                        <p style={{ margin: '4px 0', fontSize: '14px' }}>
                                            <strong>Payment Made:</strong> ${data.paymentUsed.toLocaleString()}
                                            {data.totalPayments > 0 && data.totalPayments !== data.paymentUsed && (
                                                <span style={{ color: '#52c41a', marginLeft: '8px' }}>
                                                    (Actual: ${data.totalPayments.toLocaleString()})
                                                </span>
                                            )}
                                            {data.totalPayments === 0 && data.scheduledPayment > 0 && (
                                                <span style={{ color: '#8c8c8c', marginLeft: '8px' }}>
                                                    (Scheduled: ${data.scheduledPayment.toLocaleString()})
                                                </span>
                                            )}
                                        </p>
                                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#fa8c16' }}>
                                            <strong>Interest Paid:</strong> ${data.totalInterest.toLocaleString()}
                                        </p>
                                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#1890ff' }}>
                                            <strong>Actual Balance:</strong> ${data.balance.toLocaleString()}
                                        </p>
                                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#ff4d4f' }}>
                                            <strong>Min Payment Balance:</strong> ${data.minimumPaymentBalance.toLocaleString()}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#1890ff"
                        strokeWidth={3}
                        dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                        name="Actual Balance"
                    />
                    <Line
                        type="monotone"
                        dataKey="minimumPaymentBalance"
                        stroke="#ff4d4f"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#ff4d4f', strokeWidth: 2, r: 3 }}
                        name="Minimum Payment Balance"
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => {
                            if (value === 'Actual Balance') {
                                return <span style={{ color: '#1890ff' }}>● {value}</span>;
                            } else if (value === 'Minimum Payment Balance') {
                                return <span style={{ color: '#ff4d4f' }}>● {value}</span>;
                            }
                            return value;
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export { BalanceChart };
export default BalanceChart;