import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import './Button.css';

interface BaseButtonProps extends Omit<AntButtonProps, 'type' | 'variant'> {
    variant?: 'primary' | 'danger' | 'ghost';
    size?: 'small' | 'middle' | 'large';
}

export const Button: React.FC<BaseButtonProps> = ({
    variant = 'primary',
    size = 'middle',
    className = '',
    children,
    ...props
}) => {
    const getButtonType = (): 'primary' | 'default' | 'dashed' | 'link' | 'text' => {
        switch (variant) {
            case 'primary':
                return 'primary';
            case 'danger':
                return 'primary';
            case 'ghost':
                return 'primary';
            default:
                return 'primary';
        }
    };

    const getButtonClass = () => {
        const baseClass = 'custom-button';
        const variantClass = `custom-button--${variant}`;
        const sizeClass = `custom-button--${size}`;
        return `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();
    };

    return (
        <AntButton
            {...props}
            type={getButtonType()}
            className={getButtonClass()}
            size={size}
        >
            {children}
        </AntButton>
    );
};

// Specific button variants for common use cases
export const PrimaryButton: React.FC<Omit<BaseButtonProps, 'variant'>> = (props) => (
    <Button {...props} variant="primary" />
);

export const DangerButton: React.FC<Omit<BaseButtonProps, 'variant'>> = (props) => (
    <Button {...props} variant="danger" />
);

export const GhostButton: React.FC<Omit<BaseButtonProps, 'variant'>> = (props) => (
    <Button {...props} variant="ghost" />
);
