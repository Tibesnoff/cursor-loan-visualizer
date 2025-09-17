import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, message, Divider, Tooltip, Alert } from 'antd';
import { PrimaryButton, DangerButton, CustomModal } from '../ui';
import { QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addPayment } from '../../store/slices/paymentsSlice';
import { createPayment, getRemainingBalanceForLoan } from '../../utils/dataUtils';
import { isPaymentLate, getDaysLate, getPreviousPaymentDueDate } from '../../utils/loanInterestRules';
import { normalizeLoanDates, applyPaymentToBalance } from '../../utils/consolidatedCalculations';
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
    const [paymentDate, setPaymentDate] = useState<dayjs.Dayjs | null>(null);

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

    // Check if payment is late
    const isLate = selectedLoan && paymentDate ? isPaymentLate(selectedLoan, paymentDate.toDate()) : false;
    const daysLate = selectedLoan && paymentDate ? getDaysLate(selectedLoan, paymentDate.toDate()) : 0;
    const expectedDueDate = selectedLoan && paymentDate ? getPreviousPaymentDueDate(selectedLoan, paymentDate.toDate()) : null;

    const handleSubmit = async (values: {
        loanId: string;
        amount: number;
        paymentDate: { toDate: () => Date };
        notes?: string;
    }) => {
        if (!selectedLoan) {
            message.error('Please select a loan');
            return;
        }

        setLoading(true);
        try {
            const paymentDate = values.paymentDate.toDate();
            const amount = values.amount;

            // Calculate interest and principal amounts using proper loan rules
            // Don't use getRemainingBalanceForLoan as it might have incorrect data
            // Instead, calculate the balance properly from the loan principal and all payments
            const loanPayments = payments.filter(p => p.loanId === selectedLoan.id);
            const sortedLoanPayments = loanPayments.sort((a, b) =>
                new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
            );

            // Calculate the actual current balance by processing all payments
            const normalizedLoan = normalizeLoanDates(selectedLoan);
            let currentBalance = selectedLoan.principal;
            let lastPaymentDate = normalizedLoan.interestStartDate;

            for (const payment of sortedLoanPayments) {
                const paymentResult = applyPaymentToBalance(
                    currentBalance,
                    payment,
                    normalizedLoan,
                    lastPaymentDate
                );
                currentBalance = paymentResult.newBalance;
                lastPaymentDate = new Date(payment.paymentDate);
            }

            // Create a temporary payment object for calculation
            const tempPayment = {
                id: 'temp',
                loanId: selectedLoan.id,
                amount: amount,
                principalPaid: 0,
                interestPaid: 0,
                paymentDate: paymentDate,
                remainingBalance: 0,
                isExtraPayment: false,
                notes: '',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Use the consolidated payment calculation logic
            const paymentResult = applyPaymentToBalance(
                currentBalance,
                tempPayment,
                normalizedLoan,
                lastPaymentDate
            );

            const interestAmount = paymentResult.interestPaid;
            const principalAmount = paymentResult.principalPaid;
            const newBalance = paymentResult.newBalance;

            console.log('Payment calculation result:', paymentResult);
            console.log('Current balance before payment:', currentBalance);
            console.log('Payment amount:', amount);

            // Determine if this is an extra payment
            const isExtraPayment = selectedLoan.minimumPayment
                ? amount > selectedLoan.minimumPayment
                : false; // For loans without minimum payments, we'll consider it extra if it's more than the calculated monthly payment

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
            console.error('Error adding payment:', error);
            message.error('Failed to add payment. Please check your input and try again.');
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
        <CustomModal
            title="Add New Payment"
            visible={visible}
            onCancel={handleCancel}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="payment-form"
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

                {/* Late Payment Warning */}
                {isLate && (
                    <Alert
                        message="Late Payment Detected"
                        description={
                            <div>
                                <p>This payment is <strong>{daysLate} days late</strong>.</p>
                                <p>Expected due date: <strong>{expectedDueDate?.toLocaleDateString()}</strong></p>
                                <p>Additional interest may be charged for the late period.</p>
                            </div>
                        }
                        type="warning"
                        icon={<ExclamationCircleOutlined />}
                        showIcon
                        className="late-payment-warning"
                    />
                )}

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
                                <Tooltip title="When did you make this payment? Future dates are not allowed.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please select a payment date' },
                            {
                                validator: (_, value) => {
                                    if (value && value.isAfter(dayjs(), 'day')) {
                                        return Promise.reject(new Error('Payment date cannot be in the future'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                        className="form-item-half"
                    >
                        <DatePicker
                            placeholder="Select payment date"
                            className="date-picker"
                            disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                            defaultValue={dayjs()}
                            onChange={(date) => setPaymentDate(date)}
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
                    <DangerButton onClick={handleCancel}>
                        Cancel
                    </DangerButton>
                    <PrimaryButton
                        htmlType="submit"
                        loading={loading}
                    >
                        Add Payment
                    </PrimaryButton>
                </div>
            </Form>
        </CustomModal>
    );
};
