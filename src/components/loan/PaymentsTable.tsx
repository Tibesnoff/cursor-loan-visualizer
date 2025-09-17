import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, message, Collapse, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EditPaymentModal } from '../forms/EditPaymentModal';
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
    const [tableExpanded, setTableExpanded] = useState(false);

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

    const toggleTableExpansion = () => {
        setTableExpanded(!tableExpanded);
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            width: 120,
            render: (date: Date) => formatDate(date),
            sorter: (a: Payment, b: Payment) =>
                new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime(),
            defaultSortOrder: 'descend' as const,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: 100,
            render: (amount: number) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {formatCurrency(amount)}
                </span>
            ),
            sorter: (a: Payment, b: Payment) => a.amount - b.amount,
        },
        {
            title: 'Principal',
            dataIndex: 'principalAmount',
            key: 'principalAmount',
            width: 100,
            render: (amount: number) => (
                <span style={{ color: '#52c41a' }}>
                    {formatCurrency(amount)}
                </span>
            ),
            sorter: (a: Payment, b: Payment) => a.principalAmount - b.principalAmount,
        },
        {
            title: 'Interest',
            dataIndex: 'interestAmount',
            key: 'interestAmount',
            width: 100,
            render: (amount: number) => (
                <span style={{ color: '#fa8c16' }}>
                    {formatCurrency(amount)}
                </span>
            ),
            sorter: (a: Payment, b: Payment) => a.interestAmount - b.interestAmount,
        },
        {
            title: 'Balance',
            dataIndex: 'remainingBalance',
            key: 'remainingBalance',
            width: 120,
            render: (balance: number) => (
                <span style={{ fontWeight: 'bold' }}>
                    {formatCurrency(balance)}
                </span>
            ),
            sorter: (a: Payment, b: Payment) => a.remainingBalance - b.remainingBalance,
        },
        {
            title: 'Type',
            dataIndex: 'isExtraPayment',
            key: 'isExtraPayment',
            width: 80,
            render: (isExtra: boolean) => (
                <Tag color={isExtra ? 'blue' : 'default'}>
                    {isExtra ? 'Extra' : 'Regular'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record: Payment) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        size="small"
                        title="Edit payment"
                    />
                    <Popconfirm
                        title="Delete Payment"
                        description="Are you sure you want to delete this payment? This action cannot be undone."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes, delete"
                        cancelText="Cancel"
                        okType="danger"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            title="Delete payment"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];


    if (loanPayments.length === 0) {
        return (
            <Collapse>
                <Panel
                    header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Payment History (0 payments)</span>
                            <Button
                                type="text"
                                icon={tableExpanded ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTableExpansion();
                                }}
                                size="small"
                            />
                        </div>
                    }
                    key="payments"
                    showArrow={false}
                >
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        <p>No payments recorded for this loan yet.</p>
                        <p>Add your first payment to get started!</p>
                    </div>
                </Panel>
            </Collapse>
        );
    }

    return (
        <>
            <Collapse>
                <Panel
                    header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Payment History ({loanPayments.length} payments)</span>
                            <Button
                                type="text"
                                icon={tableExpanded ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTableExpansion();
                                }}
                                size="small"
                                title={tableExpanded ? 'Collapse table' : 'Expand table'}
                            />
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
                        scroll={{ x: 800 }}
                        summary={(pageData) => {
                            const totalPaid = pageData.reduce((sum, payment) => sum + payment.amount, 0);
                            const totalPrincipal = pageData.reduce((sum, payment) => sum + payment.principalAmount, 0);
                            const totalInterest = pageData.reduce((sum, payment) => sum + payment.interestAmount, 0);

                            return (
                                <Table.Summary fixed>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={2}>
                                            <strong>Page Totals:</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={2}>
                                            <strong style={{ color: '#52c41a' }}>
                                                {formatCurrency(totalPaid)}
                                            </strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3}>
                                            <strong style={{ color: '#52c41a' }}>
                                                {formatCurrency(totalPrincipal)}
                                            </strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}>
                                            <strong style={{ color: '#fa8c16' }}>
                                                {formatCurrency(totalInterest)}
                                            </strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={5} colSpan={2} />
                                    </Table.Summary.Row>
                                </Table.Summary>
                            );
                        }}
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
