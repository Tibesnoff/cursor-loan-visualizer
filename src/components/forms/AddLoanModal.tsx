import React, { useState } from 'react';
import { Form, message } from 'antd';
import { CustomModal } from '../ui';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addLoan } from '../../store/slices/loansSlice';
import { createLoan } from '../../utils/dataUtils';
import { LoanType, InterestAccrualMethod } from '../../types';
import { useFormManagement } from '../../hooks';
import LoanFormFields from './shared/LoanFormFields';
import FormActions from './shared/FormActions';
import { getLoanTypesForForm } from '../../utils/loanUtils';

interface AddLoanModalProps {
    visible: boolean;
    onCancel: () => void;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({ visible, onCancel }) => {
    const dispatch = useAppDispatch();
    const { currentUser } = useAppSelector((state) => state.user);
    const [selectedLoanType, setSelectedLoanType] = useState<string>('');

    const { form, loading, handleSubmit, handleCancel } = useFormManagement({
        onSuccess: () => {
            message.success('Loan added successfully!');
            setSelectedLoanType('');
            onCancel();
        },
        onError: (error) => {
            message.error('Failed to add loan. Please check your input and try again.');
            console.error('Error adding loan:', error);
        },
    });

    const onSubmit = async (values: {
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
        if (!currentUser) {
            message.error('Please create a user profile first');
            return;
        }

        // Use the term if provided, otherwise set to 0 for loans without fixed terms
        const termMonths = values.termMonths || 0;

        // All loans use monthly payments
        const paymentFrequency = 'monthly';

        // Get minimum payment for loans that need it
        const loanTypes = getLoanTypesForForm();
        const selectedType = loanTypes.find((type: any) => type.value === values.loanType);
        const minimumPayment = selectedType?.needsMinimumPayment ? values.minimumPayment : undefined;

        const newLoan = createLoan(
            currentUser.id,
            values.name,
            values.principal,
            values.interestRate,
            termMonths,
            values.disbursementDate.toDate(),
            paymentFrequency,
            values.loanType as LoanType,
            minimumPayment,
            values.paymentDueDay,
            values.firstPaymentDueDate.toDate(),
            values.interestAccrualMethod as InterestAccrualMethod,
            values.isSubsidized,
            values.interestStartDate.toDate(),
            values.gracePeriodMonths
        );

        dispatch(addLoan(newLoan));
    };

    return (
        <CustomModal
            title="Add New Loan"
            visible={visible}
            onCancel={handleCancel}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => handleSubmit(() => onSubmit(values))}
                className="loan-form"
            >
                <LoanFormFields
                    selectedLoanType={selectedLoanType}
                    onLoanTypeChange={setSelectedLoanType}
                />

                <FormActions
                    onCancel={handleCancel}
                    onSubmit={() => form.submit()}
                    submitText="Add Loan"
                    loading={loading}
                />
            </Form>
        </CustomModal>
    );
};
