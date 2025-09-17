import React from 'react';
import { Modal as AntModal } from 'antd';
import './Modal.css';

interface CustomModalProps {
    title: string;
    visible: boolean;
    onCancel: () => void;
    children: React.ReactNode;
    width?: number;
    className?: string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
    title,
    visible,
    onCancel,
    children,
    width = 600,
    className = '',
}) => {
    return (
        <AntModal
            title={title}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={width}
            className={`custom-modal ${className}`}
        >
            <div className="modal-content">
                {children}
            </div>
        </AntModal>
    );
};
