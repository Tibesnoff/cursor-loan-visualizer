import React from 'react';
import { Form, Divider, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import FormField, { FieldProps } from './FormField';

export interface FormSectionProps {
    title?: string;
    fields: FieldProps[];
    showDivider?: boolean;
    alert?: {
        message: string;
        description?: string;
        type?: 'success' | 'info' | 'warning' | 'error';
    };
    className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
    title,
    fields,
    showDivider = false,
    alert,
    className = 'form-section'
}) => {
    return (
        <div className={className}>
            {title && <h4 className="section-title">{title}</h4>}

            {alert && (
                <Alert
                    message={alert.message}
                    description={alert.description}
                    type={alert.type || 'info'}
                    icon={alert.type === 'warning' ? <ExclamationCircleOutlined /> : undefined}
                    showIcon
                    className="form-alert"
                />
            )}

            <div className="form-row">
                {fields.map((field, index) => (
                    <FormField key={`${field.name}-${index}`} {...field} />
                ))}
            </div>

            {showDivider && <Divider className="form-divider" />}
        </div>
    );
};

export default FormSection;
