import React from 'react';
import { Card, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { PieChart as RechartsPieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import './Charts.css';

interface OneTimePaymentChartProps {
    monthlyPayment: number;
    currentBalance: number;
    interestRate: number;
}

export const OneTimePaymentChart: React.FC<OneTimePaymentChartProps> = ({
    monthlyPayment,
    currentBalance,
    interestRate
}) => {
    const paymentData = [
        {
            name: 'To Principal',
            value: Math.max(0, monthlyPayment - (currentBalance * interestRate / 100 / 12)),
            color: '#52c41a'
        },
        {
            name: 'To Interest',
            value: Math.max(currentBalance * interestRate / 100 / 12, 0.01),
            color: '#fa8c16'
        },
    ];

    const totalPayment = paymentData.reduce((sum, item) => sum + item.value, 0);

    return (
        <Card
            title={
                <span>
                    One Time Payment - Total: ${totalPayment.toLocaleString()}
                    <Tooltip title="Shows how a single payment is split between interest and principal">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            }
            className="chart-card"
        >
            <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                    <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                    >
                        {paymentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string, entry: { payload?: { value?: number }; color?: string }) => {
                            const total = paymentData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = (((entry.payload?.value || 0) / total) * 100).toFixed(2);
                            return (
                                <span style={{ color: entry.color || '#000' }}>
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
                </RechartsPieChart>
            </ResponsiveContainer>
        </Card>
    );
};
