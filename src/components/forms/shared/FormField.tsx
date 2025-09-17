import React from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Tooltip, Checkbox } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

export interface FormFieldProps {
    name: string;
    label: string;
    tooltip?: string;
    required?: boolean;
    rules?: any[];
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    initialValue?: any;
}

export interface InputNumberFieldProps extends FormFieldProps {
    type: 'inputNumber';
    formatter?: (value: string | number | undefined) => string;
    parser?: (value: string | undefined) => string;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    prefix?: string;
}

export interface DatePickerFieldProps extends FormFieldProps {
    type: 'datePicker';
    disabledDate?: (current: dayjs.Dayjs) => boolean;
    defaultValue?: dayjs.Dayjs;
    onChange?: (date: dayjs.Dayjs | null) => void;
}

export interface SelectFieldProps extends FormFieldProps {
    type: 'select';
    options: Array<{ value: string; label: string; disabled?: boolean }>;
    onChange?: (value: string) => void;
    mode?: 'multiple' | 'tags';
}

export interface TextAreaFieldProps extends FormFieldProps {
    type: 'textArea';
    rows?: number;
    maxLength?: number;
    showCount?: boolean;
}

export interface CheckboxFieldProps extends FormFieldProps {
    type: 'checkbox';
    valuePropName?: string;
}

export type FieldProps =
    | InputNumberFieldProps
    | DatePickerFieldProps
    | SelectFieldProps
    | TextAreaFieldProps
    | CheckboxFieldProps;

const FormField: React.FC<FieldProps> = (props) => {
    const { name, label, tooltip, required, rules, className, placeholder, disabled, initialValue } = props;

    const labelElement = (
        <span>
            {label}
            {tooltip && (
                <Tooltip title={tooltip}>
                    <QuestionCircleOutlined className="field-tooltip-icon" />
                </Tooltip>
            )}
        </span>
    );

    const formItemProps = {
        name,
        label: labelElement,
        rules: required ? [{ required: true, message: `Please ${label.toLowerCase()}` }, ...(rules || [])] : rules,
        className: className || 'form-item-half',
        initialValue,
    };

    const renderField = () => {
        switch (props.type) {
            case 'inputNumber':
                return (
                    <InputNumber
                        placeholder={placeholder}
                        disabled={disabled}
                        formatter={props.formatter}
                        parser={props.parser}
                        min={props.min}
                        max={props.max}
                        step={props.step}
                        precision={props.precision}
                        prefix={props.prefix}
                        className={props.className?.replace('form-item-', '') + '-input'}
                    />
                );

            case 'datePicker':
                return (
                    <DatePicker
                        placeholder={placeholder}
                        disabled={disabled}
                        disabledDate={props.disabledDate}
                        defaultValue={props.defaultValue}
                        onChange={props.onChange}
                        className="date-picker"
                    />
                );

            case 'select':
                return (
                    <Select
                        placeholder={placeholder}
                        disabled={disabled}
                        onChange={props.onChange}
                        mode={props.mode}
                        className={props.className?.replace('form-item-', '') + '-select'}
                    >
                        {props.options.map(option => (
                            <Option key={option.value} value={option.value} disabled={option.disabled}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                );

            case 'textArea':
                return (
                    <TextArea
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={props.rows}
                        maxLength={props.maxLength}
                        showCount={props.showCount}
                        className={props.className?.replace('form-item-', '') + '-input'}
                    />
                );

            case 'checkbox':
                return (
                    <Checkbox disabled={disabled}>
                        {placeholder}
                    </Checkbox>
                );

            default:
                return null;
        }
    };

    return (
        <Form.Item {...formItemProps}>
            {renderField()}
        </Form.Item>
    );
};

export default FormField;
