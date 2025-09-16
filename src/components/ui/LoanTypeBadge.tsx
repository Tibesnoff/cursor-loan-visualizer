import React from 'react';
import { Tag } from 'antd';
import { LoanType } from '../../types';
import { getLoanTypeColor, getLoanTypeLabel } from '../../utils/loanUtils';
import './LoanTypeBadge.css';

interface LoanTypeBadgeProps {
    loanType: LoanType;
    className?: string;
}

export const LoanTypeBadge: React.FC<LoanTypeBadgeProps> = ({
    loanType,
    className
}) => {
    const color = getLoanTypeColor(loanType);
    const label = getLoanTypeLabel(loanType);

    return (
        <Tag color={color} className={className}>
            {label}
        </Tag>
    );
};
