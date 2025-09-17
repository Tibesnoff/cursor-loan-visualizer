import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, message, Space, Button } from 'antd';
import { CustomModal, DangerButton, PrimaryButton } from '../ui';
import { useAppDispatch } from '../../hooks/redux';
import { updatePayment, deletePayment } from '../../store/slices/paymentsSlice';
import { Payment } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface EditPaymentModalProps {
    visible: boolean;
    payment: Payment | null;
    onCancel: () => void;
    onSuccess: () => void;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
    visible,
    payment,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && payment) {
            form.setFieldsValue({
                amount: payment.amount,
                paymentDate: dayjs(payment.paymentDate),
                notes: payment.notes || '',
            });
        }
    }, [visible, payment, form]);

    const handleSubmit = async (values: {
        amount: number;
        paymentDate: { toDate: () => Date };
        notes?: string;
    }) => {
        if (!payment) return;

        setLoading(true);
        try {
            const updatedPayment: Payment = {
                ...payment,
                amount: values.amount,
                paymentDate: values.paymentDate.toDate(),
                notes: values.notes || '',
                updatedAt: new Date(),
            };

            dispatch(updatePayment(updatedPayment));
            message.success('Payment updated successfully!');
            onSuccess();
        } catch (error) {
            console.error('Error updating payment:', error);
            message.error('Failed to update payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!payment) return;

        try {
            dispatch(deletePayment(payment.id));
            message.success('Payment deleted successfully!');
            onSuccess();
        } catch (error) {
            console.error('Error deleting payment:', error);
            message.error('Failed to delete payment. Please try again.');
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    if (!payment) return null;

    return (
        <CustomModal
            title="Edit Payment"
            visible={visible}
            onCancel={handleCancel}
            width={600}
        >
            <div className="payment-info-section">
                <h4>Payment Information</h4>
                <div className="payment-details-grid">
                    <div className="detail-item">
                        <label>Original Amount:</label>
                        <span>{formatCurrency(payment.amount)}</span>
                    </div>
                    <div className="detail-item">
                        <label>Principal Paid:</label>
                        <span>{formatCurrency(payment.principalAmount)}</span>
                    </div>
                    <div className="detail-item">
                        <label>Interest Paid:</label>
                        <span>{formatCurrency(payment.interestAmount)}</span>
                    </div>
                    <div className="detail-item">
                        <label>Remaining Balance:</label>
                        <span>{formatCurrency(payment.remainingBalance)}</span>
                    </div>
                    <div className="detail-item">
                        <label>Payment Type:</label>
                        <span>{payment.isExtraPayment ? 'Extra Payment' : 'Regular Payment'}</span>
                    </div>
                    <div className="detail-item">
                        <label>Created:</label>
                        <span>{payment.createdAt.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="edit-payment-form"
            >
                <div className="edit-section">
                    <h4>Edit Payment</h4>
                    <Form.Item
                        name="amount"
                        label="Payment Amount"
                        rules={[
                            { required: true, message: 'Please enter the payment amount' },
                            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
                        ]}
                    >
                        <InputNumber
                            prefix="$"
                            placeholder="0.00"
                            style={{ width: '100%' }}
                            precision={2}
                            min={0.01}
                        />
                    </Form.Item>

                    <Form.Item
                        name="paymentDate"
                        label="Payment Date"
                        rules={[{ required: true, message: 'Please select the payment date' }]}
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes (Optional)"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Add any notes about this payment..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>
                </div>

                <div className="modal-actions">
                    <Space>
                        <PrimaryButton
                            htmlType="submit"
                            loading={loading}
                        >
                            Update Payment
                        </PrimaryButton>
                        <DangerButton
                            onClick={handleDelete}
                            loading={loading}
                        >
                            Delete Payment
                        </DangerButton>
                    </Space>
                </div>
            </Form>
        </CustomModal>
    );
};
