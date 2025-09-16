import React from 'react';
import { Card, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { PieChart as RechartsPieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import './Charts.css';

interface PieChartProps {
    title: string;
    tooltip: string;
    data: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
    title,
    tooltip,
    data,
    height = 300
}) => {
    return (
        <Card
            title={
                <span>
                    {title}
                    <Tooltip title={tooltip}>
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            }
            className="chart-card"
        >
            <ResponsiveContainer width="100%" height={height}>
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry: any) => {
                            const total = data.reduce((sum, item) => sum + item.value, 0);
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
                </RechartsPieChart>
            </ResponsiveContainer>
        </Card>
    );
};
