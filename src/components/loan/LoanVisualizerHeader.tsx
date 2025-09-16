import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

interface LoanVisualizerHeaderProps {
    loanName: string;
    onBack: () => void;
    onAddPayment: () => void;
}

export const LoanVisualizerHeader: React.FC<LoanVisualizerHeaderProps> = ({
    loanName,
    onBack,
    onAddPayment
}) => {
    return (
        <div className="visualizer-header">
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                className="back-button"
            >
                Back to Loans
            </Button>
            <h1 className="visualizer-title">{loanName}</h1>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddPayment}
                className="add-payment-button"
            >
                Add Payment
            </Button>
        </div>
    );
};
