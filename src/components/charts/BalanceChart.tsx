import React from 'react';
import { Card, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Payment } from '../../types';
import './Charts.css';

interface BalanceChartProps {
    paymentScheduleData: any[];
    loanPayments: Payment[];
    loan: {
        minimumPayment?: number;
    };
}

export const BalanceChart: React.FC<BalanceChartProps> = ({
    paymentScheduleData,
    loanPayments,
    loan
}) => {
    return (
        <Card
            title={
                <span>
                    Loan Balance Over Time
                    <Tooltip title={
                        "Shows your actual loan balance (blue line) vs projected balance (gray dashed line) and actual payments made (green dashed line). The actual balance reflects all payments you've made."
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
                            name === 'actualBalance' ? 'Actual Balance' :
                                name === 'projectedBalance' ? 'Projected Balance' :
                                    name === 'actualPayment' ? 'Actual Payment Made' : 'Unknown'
                        ]}
                        labelFormatter={(month) => `Month ${month}`}
                    />
                    <Legend />

                    {/* Actual balance line (with payments applied) */}
                    <Line
                        yAxisId="balance"
                        type="monotone"
                        dataKey="actualBalance"
                        stroke="#1890ff"
                        strokeWidth={3}
                        name="Actual Balance"
                        dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                    />

                    {/* Projected balance line (without actual payments) */}
                    <Line
                        yAxisId="balance"
                        type="monotone"
                        dataKey="projectedBalance"
                        stroke="#d9d9d9"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        name="Projected Balance"
                        dot={{ fill: '#d9d9d9', strokeWidth: 1, r: 3 }}
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
    );
};
