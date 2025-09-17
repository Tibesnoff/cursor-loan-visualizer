import React from 'react';
import { Button, Popconfirm } from 'antd';
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
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                className="back-button"
            >
                Back to Loans
            </Button>
            <h1 className="visualizer-title">{loanName}</h1>
            <div className="header-actions">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={onAddPayment}
                    className="add-payment-button"
                >
                    Add Payment
                </Button>
                <Popconfirm
                    title="Delete Loan"
                    description="Are you sure you want to delete this loan? This action cannot be undone."
                    onConfirm={onDelete}
                    okText="Yes, Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        className="delete-loan-button"
                    >
                        Delete Loan
                    </Button>
                </Popconfirm>
            </div>
        </div>
    );
};
