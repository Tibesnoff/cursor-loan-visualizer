import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, message, Tooltip, Checkbox } from 'antd';
import { PrimaryButton, DangerButton } from '../ui/Button';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../hooks/redux';
import { updateLoan } from '../../store/slices/loansSlice';
import { getLoanTypesForForm } from '../../utils/loanUtils';
import { Loan, LoanType, InterestAccrualMethod } from '../../types';
import dayjs from 'dayjs';
import './AddLoanModal.css';

const { Option } = Select;

interface EditLoanModalProps {
    visible: boolean;
    onCancel: () => void;
    loan: Loan | null;
}

export const EditLoanModal: React.FC<EditLoanModalProps> = ({ visible, onCancel, loan }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [selectedLoanType, setSelectedLoanType] = useState<string>('');

    const loanTypes = getLoanTypesForForm();
    const selectedType = loanTypes.find(type => type.value === selectedLoanType);

    // Populate form when loan changes
    useEffect(() => {
        if (visible && loan) {
            setSelectedLoanType(loan.loanType);
            form.setFieldsValue({
                name: loan.name,
                loanType: loan.loanType,
                principal: loan.principal,
                interestRate: loan.interestRate,
                termMonths: loan.termMonths,
                disbursementDate: dayjs(loan.disbursementDate),
                interestStartDate: dayjs(loan.interestStartDate),
                firstPaymentDueDate: dayjs(loan.firstPaymentDueDate),
                paymentFrequency: loan.paymentFrequency,
                minimumPayment: loan.minimumPayment,
                paymentDueDay: loan.paymentDueDay,
                interestAccrualMethod: loan.interestAccrualMethod,
                isSubsidized: loan.isSubsidized,
                gracePeriodMonths: loan.gracePeriodMonths,
            });
        } else if (visible && !loan) {
            form.resetFields();
        }
    }, [visible, loan, form]);

    const handleSubmit = async (values: {
        name: string;
        loanType: string;
        principal: number;
        interestRate: number;
        termMonths: number;
        disbursementDate: { toDate: () => Date };
        interestStartDate: { toDate: () => Date };
        firstPaymentDueDate: { toDate: () => Date };
        paymentFrequency: string;
        minimumPayment?: number;
        paymentDueDay?: number;
        interestAccrualMethod: string;
        isSubsidized?: boolean;
        gracePeriodMonths?: number;
    }) => {
        if (!loan) {
            message.error('No loan selected for editing');
            return;
        }

        setLoading(true);
        try {
            // Use the term if provided, otherwise set to 0 for loans without fixed terms
            const termMonths = values.termMonths || 0;

            // Get minimum payment for loans that need it
            const minimumPayment = selectedType?.needsMinimumPayment ? values.minimumPayment : undefined;

            const updates: Partial<Loan> = {
                name: values.name,
                loanType: values.loanType as LoanType,
                principal: values.principal,
                interestRate: values.interestRate,
                termMonths,
                disbursementDate: values.disbursementDate.toDate(),
                interestStartDate: values.interestStartDate.toDate(),
                firstPaymentDueDate: values.firstPaymentDueDate.toDate(),
                paymentFrequency: values.paymentFrequency as any,
                minimumPayment,
                paymentDueDay: values.paymentDueDay,
                interestAccrualMethod: values.interestAccrualMethod as InterestAccrualMethod,
                isSubsidized: values.isSubsidized,
                gracePeriodMonths: values.gracePeriodMonths,
                updatedAt: new Date(),
            };

            dispatch(updateLoan({ id: loan.id, updates }));
            message.success('Loan updated successfully!');
            onCancel();
        } catch (error) {
            console.error('Error updating loan:', error);
            message.error('Failed to update loan. Please check your input and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setSelectedLoanType('');
        onCancel();
    };

    if (!loan) {
        return null;
    }

    return (
        <Modal
            title="Edit Loan"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={600}
            className="add-loan-modal"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="loan-form"
            >
                <Form.Item
                    name="loanType"
                    label={
                        <span>
                            Loan Type
                            <Tooltip title="Choose the type of loan. Different loan types have different rules and requirements.">
                                <QuestionCircleOutlined className="field-tooltip-icon" />
                            </Tooltip>
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select a loan type' }]}
                >
                    <Select
                        placeholder="Select loan type"
                        onChange={(value) => setSelectedLoanType(value)}
                        className="loan-type-select"
                    >
                        {loanTypes.map(type => (
                            <Option key={type.value} value={type.value}>
                                {type.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="form-row">
                    <Form.Item
                        name="name"
                        label={
                            <span>
                                Loan Name
                                <Tooltip title="Give your loan a descriptive name to easily identify it later.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter a loan name' }]}
                        className="form-item-half"
                    >
                        <Input placeholder="e.g., My Car Loan, House Mortgage, etc." />
                    </Form.Item>

                    <Form.Item
                        name="principal"
                        label={
                            <span>
                                Principal Amount
                                <Tooltip title="The original amount of money you borrowed. This is the base loan amount before interest.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter the principal amount' },
                            { type: 'number', min: 1, message: 'Amount must be greater than 0' }
                        ]}
                        className="form-item-half"
                    >
                        <InputNumber
                            placeholder="25000"
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                            className="currency-input"
                        />
                    </Form.Item>
                </div>

                <div className="form-row">
                    <Form.Item
                        name="interestRate"
                        label={
                            <span>
                                Interest Rate (%)
                                <Tooltip title="The annual percentage rate (APR) charged on your loan. This determines how much extra you'll pay for borrowing the money.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter the interest rate' },
                            { type: 'number', min: 0, max: 100, message: 'Rate must be between 0 and 100' }
                        ]}
                        className="form-item-half"
                    >
                        <InputNumber
                            placeholder="5.5"
                            min={0}
                            max={100}
                            step={0.1}
                            className="rate-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="paymentDueDay"
                        label={
                            <span>
                                Payment Due Day
                                <Tooltip title="What day of the month is your payment due? (1-31)">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter the payment due day' },
                            { type: 'number', min: 1, max: 31, message: 'Day must be between 1 and 31' }
                        ]}
                        className="form-item-half"
                    >
                        <InputNumber
                            placeholder="15"
                            min={1}
                            max={31}
                            className="due-day-input"
                        />
                    </Form.Item>
                </div>

                <div className="form-row">
                    {(selectedType?.hasTerm || selectedType?.needsMinimumPayment) && (
                        <Form.Item
                            name="termMonths"
                            label={
                                <span>
                                    Term (Months)
                                    <Tooltip title="How long you have to pay back the loan. For example, 60 months = 5 years. Leave empty for loans without fixed terms.">
                                        <QuestionCircleOutlined className="field-tooltip-icon" />
                                    </Tooltip>
                                </span>
                            }
                            rules={[
                                { type: 'number', min: 0, message: 'Term must be 0 or greater' }
                            ]}
                            className="form-item-half"
                        >
                            <InputNumber
                                placeholder="60 (optional)"
                                min={0}
                                max={600}
                                className="term-input"
                            />
                        </Form.Item>
                    )}

                    {selectedType?.needsMinimumPayment && (
                        <Form.Item
                            name="minimumPayment"
                            label={
                                <span>
                                    Minimum Payment
                                    <Tooltip title="The minimum amount you must pay each month. You can pay more than this amount to pay off the loan faster.">
                                        <QuestionCircleOutlined className="field-tooltip-icon" />
                                    </Tooltip>
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Please enter the minimum payment amount' },
                                { type: 'number', min: 1, message: 'Minimum payment must be greater than 0' }
                            ]}
                            className="form-item-half"
                        >
                            <InputNumber
                                placeholder="25"
                                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                className="minimum-payment-input"
                            />
                        </Form.Item>
                    )}
                </div>

                {!selectedType?.hasTerm && (
                    <div className="no-term-notice">
                        <p>
                            {selectedType?.needsMinimumPayment
                                ? "This loan type uses monthly minimum payments. You can pay more than the minimum to reduce interest and pay off the loan faster."
                                : "This loan type doesn't have a fixed term. Payments will continue until the balance is paid off."
                            }
                        </p>
                    </div>
                )}

                <div className="form-row">
                    <Form.Item
                        name="disbursementDate"
                        label={
                            <span>
                                Disbursement Date
                                <Tooltip title="When was the loan disbursed/funded? This is when you received the money.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select a disbursement date' }]}
                        className="form-item-half"
                    >
                        <DatePicker
                            placeholder="Select disbursement date"
                            className="date-picker"
                        />
                    </Form.Item>
                    <Form.Item
                        name="interestStartDate"
                        label={
                            <span>
                                Interest Start Date
                                <Tooltip title="When does interest begin accruing? This can be different from the disbursement date (e.g., student loans with grace periods).">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select an interest start date' }]}
                        className="form-item-half"
                    >
                        <DatePicker
                            placeholder="Select interest start date"
                            className="date-picker"
                        />
                    </Form.Item>
                </div>

                <div className="form-row">
                    <Form.Item
                        name="firstPaymentDueDate"
                        label={
                            <span>
                                First Payment Due Date
                                <Tooltip title="When is the first payment due? This can be different from the disbursement date (e.g., student loans with grace periods).">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select a first payment due date' }]}
                        className="form-item-half"
                    >
                        <DatePicker
                            placeholder="Select first payment due date"
                            className="date-picker"
                        />
                    </Form.Item>
                </div>

                <div className="form-row">
                    <Form.Item
                        name="interestAccrualMethod"
                        label={
                            <span>
                                Interest Accrual Method
                                <Tooltip title="How interest is calculated: Daily (like student loans) or Monthly (like traditional loans)">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select an interest accrual method' }]}
                        className="form-item-half"
                    >
                        <Select placeholder="Select accrual method">
                            <Option value="daily">Daily (Student Loans, Credit Cards)</Option>
                            <Option value="monthly">Monthly (Traditional Loans)</Option>
                        </Select>
                    </Form.Item>
                </div>

                {selectedType?.value === 'student' && (
                    <div className="form-row">
                        <Form.Item
                            name="isSubsidized"
                            label={
                                <span>
                                    Subsidized Loan
                                    <Tooltip title="Subsidized loans don't accrue interest during grace periods. Unsubsidized loans accrue interest from disbursement.">
                                        <QuestionCircleOutlined className="field-tooltip-icon" />
                                    </Tooltip>
                                </span>
                            }
                            valuePropName="checked"
                            className="form-item-half"
                        >
                            <Checkbox>This is a subsidized loan</Checkbox>
                        </Form.Item>
                        <Form.Item
                            name="gracePeriodMonths"
                            label={
                                <span>
                                    Grace Period (Months)
                                    <Tooltip title="How many months after disbursement before payments begin? Typically 6 months for student loans.">
                                        <QuestionCircleOutlined className="field-tooltip-icon" />
                                    </Tooltip>
                                </span>
                            }
                            rules={[
                                { type: 'number', min: 0, max: 24, message: 'Grace period must be between 0 and 24 months' }
                            ]}
                            className="form-item-half"
                        >
                            <InputNumber
                                placeholder="6"
                                min={0}
                                max={24}
                                className="grace-period-input"
                            />
                        </Form.Item>
                    </div>
                )}

                <div className="form-actions">
                    <DangerButton onClick={handleCancel}>
                        Cancel
                    </DangerButton>
                    <PrimaryButton
                        htmlType="submit"
                        loading={loading}
                    >
                        Update Loan
                    </PrimaryButton>
                </div>
            </Form>
        </Modal>
    );
};
