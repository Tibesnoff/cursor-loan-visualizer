import React, { useState, useEffect } from 'react';
import { Table, Space, Tooltip, Popconfirm, message } from 'antd';
import { PrimaryButton, DangerButton } from '../components/ui/Button';
import { QuestionCircleOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { deleteLoan } from '../store/slices/loansSlice';
import { AddLoanModal, AddPaymentModal, EditLoanModal, UserSetup } from '../components/forms';
import { LoanTypeBadge } from '../components/ui';
import { Loan, LoanType } from '../types';
import './MyLoans.css';

export const MyLoans: React.FC = () => {
    const { loans } = useAppSelector((state) => state.loans);
    const { currentUser } = useAppSelector((state) => state.user);
    const dispatch = useAppDispatch();
    const [modalVisible, setModalVisible] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [userSetupVisible, setUserSetupVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            setUserSetupVisible(true);
        }
    }, [currentUser]);

    const handleAddLoan = () => {
        if (!currentUser) {
            setUserSetupVisible(true);
            return;
        }
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    const handleAddPayment = () => {
        if (!currentUser) {
            setUserSetupVisible(true);
            return;
        }
        setPaymentModalVisible(true);
    };

    const handleDeleteLoan = (loanId: string) => {
        dispatch(deleteLoan(loanId));
        message.success('Loan deleted successfully');
    };

    const handleEditLoan = (loan: Loan) => {
        setSelectedLoan(loan);
        setEditModalVisible(true);
    };

    const handleEditModalCancel = () => {
        setEditModalVisible(false);
        setSelectedLoan(null);
    };

    const handlePaymentModalCancel = () => {
        setPaymentModalVisible(false);
    };

    const handleUserSetupComplete = () => {
        setUserSetupVisible(false);
    };

    const handleViewLoan = (loanId: string) => {
        navigate(`/loan/${loanId}`);
    };


    const columns = [
        {
            title: (
                <span>
                    Loan Name
                    <Tooltip title="The descriptive name you gave to this loan for easy identification.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            ),
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: (
                <span>
                    Type
                    <Tooltip title="The category of loan (Personal, Auto, Mortgage, etc.). Different types have different rules and requirements.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            ),
            dataIndex: 'loanType',
            key: 'loanType',
            render: (loanType: string) => (
                <LoanTypeBadge loanType={loanType as LoanType} />
            ),
        },
        {
            title: (
                <span>
                    Principal
                    <Tooltip title="The original amount of money you borrowed. This is the base loan amount before interest.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            ),
            dataIndex: 'principal',
            key: 'principal',
            render: (amount: number) => `$${amount.toLocaleString()}`,
        },
        {
            title: (
                <span>
                    Interest Rate
                    <Tooltip title="The annual percentage rate (APR) charged on your loan. This determines how much extra you'll pay for borrowing the money.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            ),
            dataIndex: 'interestRate',
            key: 'interestRate',
            render: (rate: number) => `${rate}%`,
        },
        {
            title: (
                <span>
                    Term
                    <Tooltip title="How long you have to pay back the loan. Some loans (like credit cards) don't have fixed terms.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            ),
            dataIndex: 'termMonths',
            key: 'termMonths',
            render: (months: number) => months === 0 ? 'No fixed term' : `${months} months`,
        },
        {
            title: (
                <span>
                    Payment
                    <Tooltip title="How often you make payments (Monthly, Bi-weekly, etc.) or the minimum payment amount for flexible loans.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            ),
            key: 'payment',
            render: (record: Loan) => {
                if (record.minimumPayment) {
                    return `Min: $${record.minimumPayment}`;
                }
                return record.paymentFrequency.charAt(0).toUpperCase() + record.paymentFrequency.slice(1);
            },
        },
        {
            title: (
                <span>
                    Start Date
                    <Tooltip title="When you first received this loan. This helps track how long you've been paying it off.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            ),
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: Date) => new Date(date).toLocaleDateString(),
        },
        {
            title: (
                <span>
                    Actions
                    <Tooltip title="View detailed loan information or delete the loan from your list.">
                        <QuestionCircleOutlined className="field-tooltip-icon" />
                    </Tooltip>
                </span>
            ),
            key: 'actions',
            render: (_: unknown, record: Loan) => (
                <Space>
                    <PrimaryButton
                        size="small"
                        onClick={() => handleViewLoan(record.id)}
                    >
                        View
                    </PrimaryButton>
                    <PrimaryButton
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditLoan(record)}
                    >
                        Edit
                    </PrimaryButton>
                    <Popconfirm
                        title="Delete Loan"
                        description="Are you sure you want to delete this loan? This action cannot be undone."
                        onConfirm={() => handleDeleteLoan(record.id)}
                        okText="Yes, Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <DangerButton size="small" icon={<DeleteOutlined />}>
                            Delete
                        </DangerButton>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="loans-page">
            <div className="loans-header">
                <h1 className="loans-title">
                    My Loans
                </h1>
                <div className="header-buttons">
                    <PrimaryButton
                        className="add-payment-button"
                        onClick={handleAddPayment}
                        icon={<PlusOutlined />}
                    >
                        Add Payment
                    </PrimaryButton>
                    <PrimaryButton
                        className="add-loan-button"
                        onClick={handleAddLoan}
                    >
                        Add New Loan
                    </PrimaryButton>
                </div>
            </div>

            {loans.length > 0 ? (
                <div className="loans-table-container">
                    <Table
                        columns={columns}
                        dataSource={loans}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} loans`,
                        }}
                        className="loans-table"
                    />
                </div>
            ) : (
                <div className="empty-state">
                    <h3 className="empty-state-title">No loans found</h3>
                    <p className="empty-state-text">
                        Get started by adding your first loan
                    </p>
                    <button className="add-loan-button" onClick={handleAddLoan}>
                        Add Your First Loan
                    </button>
                </div>
            )}

            <AddLoanModal
                visible={modalVisible}
                onCancel={handleModalCancel}
            />

            <AddPaymentModal
                visible={paymentModalVisible}
                onCancel={handlePaymentModalCancel}
            />

            <EditLoanModal
                visible={editModalVisible}
                onCancel={handleEditModalCancel}
                loan={selectedLoan}
            />

            <UserSetup
                visible={userSetupVisible}
                onComplete={handleUserSetupComplete}
            />
        </div>
    );
};
