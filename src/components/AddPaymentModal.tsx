import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message, Divider, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addPayment } from '../store/slices/paymentsSlice';
import { createPayment, getRemainingBalanceForLoan } from '../utils/dataUtils';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface AddPaymentModalProps {
    visible: boolean;
    onCancel: () => void;
    preselectedLoanId?: string; // Optional preselected loan ID
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ 
    visible, 
    onCancel, 
    preselectedLoanId 
}) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { loans } = useAppSelector((state) => state.loans);
    const { payments } = useAppSelector((state) => state.payments);
    const [loading, setLoading] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState<string>('');

    // Set preselected loan when modal opens
    useEffect(() => {
        if (visible && preselectedLoanId) {
            setSelectedLoanId(preselectedLoanId);
            form.setFieldsValue({ loanId: preselectedLoanId });
        } else if (visible) {
            setSelectedLoanId('');
            form.resetFields();
        }
    }, [visible, preselectedLoanId, form]);

    const selectedLoan = loans.find(loan => loan.id === selectedLoanId);

    const handleSubmit = async (values: any) => {
        if (!selectedLoan) {
            message.error('Please select a loan');
            return;
        }

        setLoading(true);
        try {
            const paymentDate = values.paymentDate.toDate();
            const amount = values.amount;
            
            // Calculate interest and principal amounts
            const monthlyRate = selectedLoan.interestRate / 100 / 12;
            const currentBalance = getRemainingBalanceForLoan(selectedLoan, payments);
            const interestAmount = currentBalance * monthlyRate;
            const principalAmount = Math.max(0, amount - interestAmount);
            const newBalance = Math.max(0, currentBalance - principalAmount);
            
            // Determine if this is an extra payment
            const isExtraPayment = selectedLoan.minimumPayment 
                ? amount > selectedLoan.minimumPayment 
                : amount > (selectedLoan.termMonths > 0 ? 
                    (selectedLoan.principal * monthlyRate * Math.pow(1 + monthlyRate, selectedLoan.termMonths)) / 
                    (Math.pow(1 + monthlyRate, selectedLoan.termMonths) - 1) : 0);

            const newPayment = createPayment(
                selectedLoan.id,
                amount,
                principalAmount,
                interestAmount,
                paymentDate,
                newBalance,
                isExtraPayment,
                values.notes
            );

            dispatch(addPayment(newPayment));
            message.success('Payment added successfully!');
            form.resetFields();
            setSelectedLoanId('');
            onCancel();
        } catch (error) {
            message.error('Failed to add payment');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedLoanId('');
        onCancel();
    };

    const handleLoanChange = (loanId: string) => {
        setSelectedLoanId(loanId);
    };

    return (
        <Modal
            title="Add New Payment"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            className="add-payment-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="payment-form"
                initialValues={{
                    paymentDate: dayjs(),
                }}
            >
                <Form.Item
                    name="loanId"
                    label={
                        <span>
                            Select Loan
                            <Tooltip title="Choose which loan this payment is for. This will be automatically selected if you're adding a payment from a specific loan page.">
                                <QuestionCircleOutlined className="field-tooltip-icon" />
                            </Tooltip>
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select a loan' }]}
                >
                    <Select 
                        placeholder="Select loan"
                        onChange={handleLoanChange}
                        className="loan-select"
                        disabled={!!preselectedLoanId}
                    >
                        {loans.map(loan => (
                            <Option key={loan.id} value={loan.id}>
                                {loan.name} - ${loan.principal.toLocaleString()}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {selectedLoan && (
                    <div className="loan-info">
                        <p><strong>Loan Type:</strong> {selectedLoan.loanType.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Interest Rate:</strong> {selectedLoan.interestRate}%</p>
                        <p><strong>Current Balance:</strong> ${getRemainingBalanceForLoan(selectedLoan, payments).toLocaleString()}</p>
                        {selectedLoan.minimumPayment && (
                            <p><strong>Minimum Payment:</strong> ${selectedLoan.minimumPayment}</p>
                        )}
                    </div>
                )}

                <Divider className="form-divider" />

                <div className="form-row">
                    <Form.Item
                        name="amount"
                        label={
                            <span>
                                Payment Amount
                                <Tooltip title="The total amount you're paying. This will be split between principal and interest based on your loan terms.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter the payment amount' },
                            { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
                        ]}
                        className="form-item-half"
                    >
                        <InputNumber
                            placeholder="500"
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                            className="currency-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="paymentDate"
                        label={
                            <span>
                                Payment Date
                                <Tooltip title="When did you make this payment? This helps track your payment history.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select a payment date' }]}
                        className="form-item-half"
                    >
                        <DatePicker
                            placeholder="Select payment date"
                            className="date-picker"
                            defaultValue={dayjs()}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="notes"
                    label={
                        <span>
                            Notes (Optional)
                            <Tooltip title="Add any notes about this payment, such as 'Extra payment' or 'Refinance payment'.">
                                <QuestionCircleOutlined className="field-tooltip-icon" />
                            </Tooltip>
                        </span>
                    }
                >
                    <TextArea
                        placeholder="e.g., Extra payment, Refinance payment, etc."
                        rows={3}
                        className="notes-input"
                    />
                </Form.Item>

                <div className="form-actions">
                    <Button onClick={handleCancel} className="cancel-button">
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="submit-button"
                    >
                        Add Payment
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
