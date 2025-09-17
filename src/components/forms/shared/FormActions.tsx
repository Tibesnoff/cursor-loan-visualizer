import React from 'react';
import { PrimaryButton, DangerButton } from '../../ui';

export interface FormActionsProps {
    onCancel: () => void;
    onSubmit: () => void;
    submitText?: string;
    cancelText?: string;
    loading?: boolean;
    submitDisabled?: boolean;
    cancelDisabled?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
    onCancel,
    onSubmit,
    submitText = 'Submit',
    cancelText = 'Cancel',
    loading = false,
    submitDisabled = false,
    cancelDisabled = false,
}) => {
    return (
        <div className="form-actions">
            <DangerButton
                onClick={onCancel}
                disabled={cancelDisabled}
            >
                {cancelText}
            </DangerButton>
            <PrimaryButton
                onClick={onSubmit}
                loading={loading}
                disabled={submitDisabled}
            >
                {submitText}
            </PrimaryButton>
        </div>
    );
};

export default FormActions;
