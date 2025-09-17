import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message, Divider, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addLoan } from '../../store/slices/loansSlice';
import { createLoan } from '../../utils/dataUtils';
import { getLoanTypesForForm } from '../../utils/loanUtils';
import dayjs from 'dayjs';
import './AddLoanModal.css';

const { Option } = Select;

interface AddLoanModalProps {
    visible: boolean;
    onCancel: () => void;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const { currentUser } = useAppSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [selectedLoanType, setSelectedLoanType] = useState<string>('');

    const loanTypes = getLoanTypesForForm();

    const selectedType = loanTypes.find(type => type.value === selectedLoanType);

    const handleSubmit = async (values: any) => {
        if (!currentUser) {
            message.error('Please create a user profile first');
            return;
        }

        setLoading(true);
        try {
            // Use the term if provided, otherwise set to 0 for loans without fixed terms
            const termMonths = values.termMonths || 0;

            // All loans use monthly payments
            const paymentFrequency = 'monthly';

            // Get minimum payment for loans that need it
            const minimumPayment = selectedType?.needsMinimumPayment ? values.minimumPayment : undefined;

            const newLoan = createLoan(
                currentUser.id,
                values.name,
                values.principal,
                values.interestRate,
                termMonths,
                values.startDate.toDate(),
                paymentFrequency,
                values.loanType,
                minimumPayment,
                values.paymentDueDay,
                values.paymentsStartDate?.toDate(),
                values.interestAccrualMethod
            );

            dispatch(addLoan(newLoan));
            message.success('Loan added successfully!');
            form.resetFields();
            setSelectedLoanType('');
            onCancel();
        } catch (error) {
            message.error('Failed to add loan');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Add New Loan"
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
                        name="startDate"
                        label={
                            <span>
                                Start Date
                                <Tooltip title="When did you first receive this loan? This helps calculate how much you've already paid.">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select a start date' }]}
                        className="form-item-half"
                    >
                        <DatePicker
                            placeholder="Select start date"
                            className="date-picker"
                            defaultValue={dayjs()}
                        />
                    </Form.Item>
                    <Form.Item
                        name="paymentsStartDate"
                        label={
                            <span>
                                Payments Start Date
                                <Tooltip title="When do payments actually begin? This can be different from the loan start date (e.g., student loans with grace periods).">
                                    <QuestionCircleOutlined className="field-tooltip-icon" />
                                </Tooltip>
                            </span>
                        }
                        className="form-item-half"
                    >
                        <DatePicker
                            placeholder="Select payments start date"
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
                        initialValue="daily"
                    >
                        <Select placeholder="Select accrual method">
                            <Option value="daily">Daily (Student Loans, Credit Cards)</Option>
                            <Option value="monthly">Monthly (Traditional Loans)</Option>
                        </Select>
                    </Form.Item>
                </div>

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
                        Add Loan
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
