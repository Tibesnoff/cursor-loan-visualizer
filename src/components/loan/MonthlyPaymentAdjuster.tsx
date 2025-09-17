import React, { useState, useCallback } from 'react';
import { Card, InputNumber, Space, message, Alert, Statistic, Row, Col } from 'antd';
import { EditOutlined, SaveOutlined, UndoOutlined, CalculatorOutlined } from '@ant-design/icons';
import { PrimaryButton, DangerButton } from '../ui/Button';
import { useMonthlyPaymentAdjustment } from '../../hooks';
import { Loan, Payment } from '../../types';
import { formatCurrencyForStatistic } from '../../utils/formatters';
import './MonthlyPaymentAdjuster.css';

interface MonthlyPaymentAdjusterProps {
    loan: Loan;
    loanPayments: Payment[];
    onPaymentChange?: (newAmount: number) => void;
}

export const MonthlyPaymentAdjuster: React.FC<MonthlyPaymentAdjusterProps> = ({
    loan,
    loanPayments,
    onPaymentChange,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempAmount, setTempAmount] = useState<number>(0);
    const [reason, setReason] = useState<string>('');

    const {
        currentMonthlyPayment,
        originalMonthlyPayment,
        isAdjusted,
        adjustment,
        adjustPayment,
        resetToOriginal,
        updateAdjustment,
        isValidAdjustment,
        getValidationMessage,
        getAdjustmentImpact,
    } = useMonthlyPaymentAdjustment({ loan, loanPayments });

    const impact = getAdjustmentImpact();

    const handleEdit = useCallback(() => {
        setTempAmount(currentMonthlyPayment);
        setReason(adjustment?.adjustmentReason || '');
        setIsEditing(true);
    }, [currentMonthlyPayment, adjustment]);

    const handleSave = useCallback(() => {
        try {
            if (isAdjusted) {
                updateAdjustment(tempAmount, reason || undefined);
            } else {
                adjustPayment(tempAmount, reason || undefined);
            }

            message.success('Monthly payment updated successfully');
            setIsEditing(false);
            onPaymentChange?.(tempAmount);
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Failed to update payment');
        }
    }, [isAdjusted, tempAmount, reason, updateAdjustment, adjustPayment, onPaymentChange]);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setTempAmount(currentMonthlyPayment);
        setReason('');
    }, [currentMonthlyPayment]);

    const handleReset = useCallback(() => {
        resetToOriginal();
        message.success('Payment reset to original amount');
        onPaymentChange?.(originalMonthlyPayment);
    }, [resetToOriginal, originalMonthlyPayment, onPaymentChange]);

    const handleAmountChange = useCallback((value: number | null) => {
        setTempAmount(value || 0);
    }, []);

    const isTempAmountValid = isValidAdjustment(tempAmount);
    const validationMessage = getValidationMessage(tempAmount);

    return (
        <Card
            title={
                <Space>
                    <CalculatorOutlined />
                    Monthly Payment Adjustment
                    {isAdjusted && (
                        <span className="adjustment-badge">
                            Adjusted
                        </span>
                    )}
                </Space>
            }
            className="monthly-payment-adjuster"
            extra={
                <Space>
                    {!isEditing ? (
                        <>
                            <PrimaryButton
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                            >
                                {isAdjusted ? 'Edit' : 'Adjust'}
                            </PrimaryButton>
                            {isAdjusted && (
                                <DangerButton
                                    icon={<UndoOutlined />}
                                    onClick={handleReset}
                                >
                                    Reset
                                </DangerButton>
                            )}
                        </>
                    ) : (
                        <>
                            <PrimaryButton
                                icon={<SaveOutlined />}
                                onClick={handleSave}
                                disabled={!isTempAmountValid}
                            >
                                Save
                            </PrimaryButton>
                            <DangerButton onClick={handleCancel}>
                                Cancel
                            </DangerButton>
                        </>
                    )}
                </Space>
            }
        >
            <div className="payment-adjuster-content">
                {isEditing ? (
                    <div className="editing-mode">
                        <div className="form-group">
                            <label>New Monthly Payment Amount:</label>
                            <InputNumber
                                value={tempAmount}
                                onChange={handleAmountChange}
                                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                min={0}
                                step={10}
                                className="payment-input"
                                status={!isTempAmountValid ? 'error' : undefined}
                            />
                            {!isTempAmountValid && validationMessage && (
                                <Alert
                                    message={validationMessage}
                                    type="error"
                                    showIcon
                                    className="validation-alert"
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label>Reason for Adjustment (Optional):</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Extra income, budget increase, etc."
                                className="reason-input"
                            />
                        </div>

                        <div className="comparison-stats">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Original Payment"
                                        value={originalMonthlyPayment}
                                        formatter={formatCurrencyForStatistic}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="New Payment"
                                        value={tempAmount}
                                        formatter={formatCurrencyForStatistic}
                                        valueStyle={{ color: isTempAmountValid ? '#52c41a' : '#ff4d4f' }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </div>
                ) : (
                    <div className="display-mode">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Current Monthly Payment"
                                    value={currentMonthlyPayment}
                                    formatter={formatCurrencyForStatistic}
                                    valueStyle={{
                                        color: isAdjusted ? '#52c41a' : '#1890ff',
                                        fontSize: '24px',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Original Payment"
                                    value={originalMonthlyPayment}
                                    formatter={formatCurrencyForStatistic}
                                    valueStyle={{ color: '#8c8c8c' }}
                                />
                            </Col>
                        </Row>

                        {isAdjusted && adjustment && (
                            <div className="adjustment-details">
                                <Alert
                                    message={`Adjusted on ${adjustment.adjustedAt.toLocaleDateString()}`}
                                    description={
                                        adjustment.adjustmentReason && (
                                            <div>
                                                <strong>Reason:</strong> {adjustment.adjustmentReason}
                                            </div>
                                        )
                                    }
                                    type="info"
                                    showIcon
                                    className="adjustment-info"
                                />
                            </div>
                        )}

                        {isAdjusted && (impact.monthlyDifference !== 0 || impact.timeSavedMonths > 0) && (
                            <div className="impact-stats">
                                <h4>Adjustment Impact</h4>
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Statistic
                                            title="Monthly Difference"
                                            value={impact.monthlyDifference}
                                            formatter={formatCurrencyForStatistic}
                                            valueStyle={{
                                                color: impact.monthlyDifference > 0 ? '#52c41a' : '#ff4d4f'
                                            }}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Statistic
                                            title="Time Saved"
                                            value={impact.timeSavedMonths}
                                            suffix="months"
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Statistic
                                            title="Interest Saved"
                                            value={impact.interestSaved}
                                            formatter={formatCurrencyForStatistic}
                                            valueStyle={{ color: '#52c41a' }}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <Statistic
                                            title="Total Savings"
                                            value={impact.totalDifference}
                                            formatter={formatCurrencyForStatistic}
                                            valueStyle={{
                                                color: impact.totalDifference > 0 ? '#52c41a' : '#ff4d4f'
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
