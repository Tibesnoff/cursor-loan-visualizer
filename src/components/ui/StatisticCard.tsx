import React from 'react';
import { Card, Statistic, Tooltip } from 'antd';
import './StatisticCard.css';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface StatisticCardProps {
    title: string;
    value: number | string;
    prefix?: string;
    suffix?: string;
    tooltip?: string;
    valueStyle?: React.CSSProperties;
    formatter?: (value: number | string) => string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
    title,
    value,
    prefix,
    suffix,
    tooltip,
    valueStyle,
    formatter,
}) => {
    return (
        <Card className="stat-card">
            <Statistic
                title={
                    <span>
                        {title}
                        {tooltip && (
                            <Tooltip title={tooltip}>
                                <QuestionCircleOutlined className="field-tooltip-icon" />
                            </Tooltip>
                        )}
                    </span>
                }
                value={value}
                prefix={prefix}
                suffix={suffix}
                valueStyle={valueStyle}
                formatter={formatter}
            />
        </Card>
    );
};
