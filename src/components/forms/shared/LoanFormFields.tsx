import React from 'react';
import { Loan, LoanType, InterestAccrualMethod } from '../../../types';
import { getLoanTypesForForm } from '../../../utils/loanUtils';
import FormField, { FieldProps } from './FormField';
import FormSection from './FormSection';
import dayjs from 'dayjs';

export interface LoanFormFieldsProps {
    selectedLoanType: string;
    onLoanTypeChange: (value: string) => void;
    loan?: Loan | null;
    isEdit?: boolean;
}

const LoanFormFields: React.FC<LoanFormFieldsProps> = ({
    selectedLoanType,
    onLoanTypeChange,
    loan,
    isEdit = false
}) => {
    const loanTypes = getLoanTypesForForm();
    const selectedType = loanTypes.find(type => type.value === selectedLoanType);

    const basicFields: FieldProps[] = [
        {
            type: 'select',
            name: 'loanType',
            label: 'Loan Type',
            tooltip: 'Choose the type of loan. Different loan types have different rules and requirements.',
            required: true,
            className: 'form-item-full',
            placeholder: 'Select loan type',
            options: loanTypes.map(type => ({
                value: type.value,
                label: type.label
            })),
            onChange: onLoanTypeChange,
        },
        {
            type: 'inputNumber',
            name: 'name',
            label: 'Loan Name',
            tooltip: 'Give your loan a descriptive name to easily identify it later.',
            required: true,
            className: 'form-item-half',
            placeholder: 'e.g., My Car Loan, House Mortgage, etc.',
        },
        {
            type: 'inputNumber',
            name: 'principal',
            label: 'Principal Amount',
            tooltip: 'The original amount of money you borrowed. This is the base loan amount before interest.',
            required: true,
            rules: [
                { type: 'number', min: 1, message: 'Amount must be greater than 0' }
            ],
            className: 'form-item-half',
            placeholder: '25000',
            formatter: (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            parser: (value) => value!.replace(/\$\s?|(,*)/g, ''),
        },
        {
            type: 'inputNumber',
            name: 'interestRate',
            label: 'Interest Rate (%)',
            tooltip: 'The annual percentage rate (APR) charged on your loan. This determines how much extra you\'ll pay for borrowing the money.',
            required: true,
            rules: [
                { type: 'number', min: 0, max: 100, message: 'Rate must be between 0 and 100' }
            ],
            className: 'form-item-half',
            placeholder: '5.5',
            min: 0,
            max: 100,
            step: 0.1,
        },
        {
            type: 'inputNumber',
            name: 'paymentDueDay',
            label: 'Payment Due Day',
            tooltip: 'What day of the month is your payment due? (1-31)',
            required: true,
            rules: [
                { type: 'number', min: 1, max: 31, message: 'Day must be between 1 and 31' }
            ],
            className: 'form-item-half',
            placeholder: '15',
            min: 1,
            max: 31,
        },
    ];

    const termAndPaymentFields: FieldProps[] = [
        ...(selectedType?.hasTerm || selectedType?.needsMinimumPayment ? [{
            type: 'inputNumber' as const,
            name: 'termMonths',
            label: 'Term (Months)',
            tooltip: 'How long you have to pay back the loan. For example, 60 months = 5 years. Leave empty for loans without fixed terms.',
            rules: [
                { type: 'number', min: 0, message: 'Term must be 0 or greater' }
            ],
            className: 'form-item-half',
            placeholder: '60 (optional)',
            min: 0,
            max: 600,
        }] : []),
        ...(selectedType?.needsMinimumPayment ? [{
            type: 'inputNumber' as const,
            name: 'minimumPayment',
            label: 'Minimum Payment',
            tooltip: 'The minimum amount you must pay each month. You can pay more than this amount to pay off the loan faster.',
            required: true,
            rules: [
                { type: 'number', min: 1, message: 'Minimum payment must be greater than 0' }
            ],
            className: 'form-item-half',
            placeholder: '25',
            formatter: (value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            parser: (value) => value!.replace(/\$\s?|(,*)/g, ''),
        }] : []),
    ];

    const dateFields: FieldProps[] = [
        {
            type: 'datePicker',
            name: 'disbursementDate',
            label: 'Disbursement Date',
            tooltip: 'When was the loan disbursed/funded? This is when you received the money.',
            required: true,
            className: 'form-item-half',
            placeholder: 'Select disbursement date',
            defaultValue: isEdit ? undefined : dayjs(),
        },
        {
            type: 'datePicker',
            name: 'interestStartDate',
            label: 'Interest Start Date',
            tooltip: 'When does interest begin accruing? This can be different from the disbursement date (e.g., student loans with grace periods).',
            required: true,
            className: 'form-item-half',
            placeholder: 'Select interest start date',
        },
        {
            type: 'datePicker',
            name: 'firstPaymentDueDate',
            label: 'First Payment Due Date',
            tooltip: 'When is the first payment due? This can be different from the disbursement date (e.g., student loans with grace periods).',
            required: true,
            className: 'form-item-half',
            placeholder: 'Select first payment due date',
        },
    ];

    const interestFields: FieldProps[] = [
        {
            type: 'select',
            name: 'interestAccrualMethod',
            label: 'Interest Accrual Method',
            tooltip: 'How interest is calculated: Daily (like student loans) or Monthly (like traditional loans)',
            required: true,
            className: 'form-item-half',
            placeholder: 'Select accrual method',
            initialValue: 'daily',
            options: [
                { value: 'daily', label: 'Daily (Student Loans, Credit Cards)' },
                { value: 'monthly', label: 'Monthly (Traditional Loans)' }
            ],
        },
    ];

    const studentLoanFields: FieldProps[] = selectedType?.value === 'student' ? [
        {
            type: 'checkbox',
            name: 'isSubsidized',
            label: 'Subsidized Loan',
            tooltip: 'Subsidized loans don\'t accrue interest during grace periods. Unsubsidized loans accrue interest from disbursement.',
            className: 'form-item-half',
            placeholder: 'This is a subsidized loan',
            valuePropName: 'checked',
            initialValue: false,
        },
        {
            type: 'inputNumber',
            name: 'gracePeriodMonths',
            label: 'Grace Period (Months)',
            tooltip: 'How many months after disbursement before payments begin? Typically 6 months for student loans.',
            rules: [
                { type: 'number', min: 0, max: 24, message: 'Grace period must be between 0 and 24 months' }
            ],
            className: 'form-item-half',
            placeholder: '6',
            min: 0,
            max: 24,
            initialValue: 6,
        },
    ] : [];

    return (
        <>
            <FormSection fields={basicFields} />

            {termAndPaymentFields.length > 0 && (
                <FormSection
                    fields={termAndPaymentFields}
                    alert={!selectedType?.hasTerm ? {
                        message: selectedType?.needsMinimumPayment
                            ? "This loan type uses monthly minimum payments. You can pay more than the minimum to reduce interest and pay off the loan faster."
                            : "This loan type doesn't have a fixed term. Payments will continue until the balance is paid off.",
                        type: 'info'
                    } : undefined}
                />
            )}

            <FormSection fields={dateFields} />
            <FormSection fields={interestFields} />

            {studentLoanFields.length > 0 && (
                <FormSection fields={studentLoanFields} />
            )}
        </>
    );
};

export default LoanFormFields;
