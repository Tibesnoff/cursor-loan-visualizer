import React from 'react';
import { Popconfirm } from 'antd';
import { PrimaryButton, DangerButton } from '../ui/Button';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface LoanVisualizerHeaderProps {
    loanName: string;
    onBack: () => void;
    onAddPayment: () => void;
    onDelete: () => void;
}

export const LoanVisualizerHeader: React.FC<LoanVisualizerHeaderProps> = ({
    loanName,
    onBack,
    onAddPayment,
    onDelete
}) => {
    return (
        <div className="visualizer-header">
            <PrimaryButton
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                className="back-button"
            >
                Back to Loans
            </PrimaryButton>
            <h1 className="visualizer-title">{loanName}</h1>
            <div className="header-actions">
                <PrimaryButton
                    icon={<PlusOutlined />}
                    onClick={onAddPayment}
                    className="add-payment-button"
                >
                    Add Payment
                </PrimaryButton>
                <Popconfirm
                    title="Delete Loan"
                    description="Are you sure you want to delete this loan? This action cannot be undone."
                    onConfirm={onDelete}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    <DangerButton
                        icon={<DeleteOutlined />}
                        className="delete-loan-button"
                    >
                        Delete Loan
                    </DangerButton>
                </Popconfirm>
            </div>
        </div>
    );
};
