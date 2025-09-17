import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useAppDispatch } from '../../hooks/redux';
import { setUser } from '../../store/slices/userSlice';
import { createUser } from '../../utils/dataUtils';
import './UserSetup.css';

interface UserSetupProps {
    visible: boolean;
    onComplete: () => void;
}

export const UserSetup: React.FC<UserSetupProps> = ({ visible, onComplete }) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: { name: string; email: string }) => {
        setLoading(true);
        try {
            const newUser = createUser(values.name, values.email);
            dispatch(setUser(newUser));
            message.success('User profile created successfully!');
            form.resetFields();
            onComplete();
        } catch (error) {
            console.error('Error creating user profile:', error);
            message.error('Failed to create user profile. Please check your input and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Welcome! Let's get started"
            open={visible}
            onCancel={() => { }}
            footer={null}
            closable={false}
            width={500}
            className="user-setup-modal"
        >
            <div className="user-setup-content">
                <p className="user-setup-description">
                    To get started with your loan tracker, please create your user profile.
                </p>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="user-setup-form"
                >
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                    >
                        <Input placeholder="Enter your full name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input placeholder="Enter your email address" />
                    </Form.Item>

                    <div className="user-setup-actions">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="user-setup-submit"
                        >
                            Create Profile
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
};
