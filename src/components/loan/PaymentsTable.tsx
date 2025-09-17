import React, { useState } from 'react';
import { Table, Space, Popconfirm, message, Collapse, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EditPaymentModal } from '../forms/EditPaymentModal';
import { Button } from '../ui/Button';
import './PaymentsTable.css';

const { Panel } = Collapse;

interface PaymentsTableProps {
    payments: Payment[];
    loanId: string;
    onPaymentUpdated: () => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
    payments,
    loanId,
    onPaymentUpdated,
}) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

    const loanPayments = payments.filter(payment => payment.loanId === loanId);

    const handleEdit = (payment: Payment) => {
        setEditingPayment(payment);
        setEditModalVisible(true);
    };

    const handleDelete = async (paymentId: string) => {
        try {
            // TODO: Implement delete payment action
            message.success('Payment deleted successfully');
            onPaymentUpdated();
        } catch (error) {
            message.error('Failed to delete payment');
        }
    };

    const handleEditComplete = () => {
        setEditModalVisible(false);
        setEditingPayment(null);
        onPaymentUpdated();
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            width: 120,
            align: 'center' as const,
            render: (date: Date) => formatDate(date),
        },
        {
            title: (
                <Tooltip title="Total payment amount made on this date">
                    Amount
                </Tooltip>
            ),
            dataIndex: 'amount',
            key: 'amount',
            width: 110,
            align: 'center' as const,
            render: (amount: number) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {formatCurrency(amount)}
                </span>
            ),
        },
        {
            title: (
                <Tooltip title="Portion of payment that reduces the loan balance">
                    Principal
                </Tooltip>
            ),
            dataIndex: 'principalAmount',
            key: 'principalAmount',
            width: 110,
            align: 'center' as const,
            render: (amount: number) => (
                <span style={{ color: '#52c41a' }}>
                    {formatCurrency(amount)}
                </span>
            ),
        },
        {
            title: (
                <Tooltip title="Portion of payment that covers interest charges">
                    Interest
                </Tooltip>
            ),
            dataIndex: 'interestAmount',
            key: 'interestAmount',
            width: 110,
            align: 'center' as const,
            render: (amount: number) => (
                <span style={{ color: '#fa8c16' }}>
                    {formatCurrency(amount)}
                </span>
            ),
        },
        {
            title: (
                <Tooltip title="Remaining loan balance after this payment">
                    Balance
                </Tooltip>
            ),
            dataIndex: 'remainingBalance',
            key: 'remainingBalance',
            width: 120,
            align: 'center' as const,
            render: (balance: number) => (
                <span style={{ fontWeight: 'bold' }}>
                    {formatCurrency(balance)}
                </span>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'isExtraPayment',
            key: 'isExtraPayment',
            width: 90,
            render: (isExtra: boolean) => (
                <Tag color={isExtra ? 'blue' : 'default'}>
                    {isExtra ? 'Extra' : 'Regular'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 220,
            render: (_, record: Payment) => (
                <Space size="small">
                    <Button
                        variant="secondary"
                        size="medium"
                        onClick={() => handleEdit(record)}
                        title="Edit payment"
                    >
                        <EditOutlined />
                    </Button>
                    <Popconfirm
                        title="Delete Payment"
                        description="Are you sure you want to delete this payment? This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes, delete"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Button
                            variant="danger"
                            size="medium"
                            title="Delete payment"
                        >
                            <DeleteOutlined />
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (loanPayments.length === 0) {
        return (
            <Collapse className="payments-table-collapse">
                <Panel
                    header={
                        <div className="payments-header">
                            <span>Payment History (0 payments)</span>
                        </div>
                    }
                    key="payments"
                    showArrow={false}
                >
                    <div className="empty-state">
                        <p>No payments recorded for this loan yet.</p>
                        <p>Add your first payment to get started!</p>
                    </div>
                </Panel>
            </Collapse>
        );
    }

    return (
        <>
            <Collapse className="payments-table-collapse">
                <Panel
                    header={
                        <div className="payments-header">
                            <span>Payment History ({loanPayments.length} payments)</span>
                        </div>
                    }
                    key="payments"
                    showArrow={false}
                >
                    <Table
                        columns={columns}
                        dataSource={loanPayments}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} payments`,
                        }}
                        size="small"
                        scroll={{ x: 940 }}
                    />
                </Panel>
            </Collapse>

            {editModalVisible && editingPayment && (
                <EditPaymentModal
                    visible={editModalVisible}
                    payment={editingPayment}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setEditingPayment(null);
                    }}
                    onSuccess={handleEditComplete}
                />
            )}
        </>
    );
};
