import React, { useEffect } from 'react';
import { message } from 'antd';
import { useAppSelector } from '../hooks/redux';
import { createError, ErrorType, logError } from '../utils/errorHandling';

export const GlobalErrorHandler: React.FC = () => {
    const userError = useAppSelector((state) => state.user.error);
    const loansError = useAppSelector((state) => state.loans.error);
    const paymentsError = useAppSelector((state) => state.payments.error);

    useEffect(() => {
        if (userError) {
            const error = createError(
                ErrorType.DATA,
                `User error: ${userError}`,
                undefined,
                'USER_STATE_ERROR'
            );
            logError(error, 'GlobalErrorHandler');
            message.error(`User Error: ${userError}`);
        }
    }, [userError]);

    useEffect(() => {
        if (loansError) {
            const error = createError(
                ErrorType.DATA,
                `Loans error: ${loansError}`,
                undefined,
                'LOANS_STATE_ERROR'
            );
            logError(error, 'GlobalErrorHandler');
            message.error(`Loans Error: ${loansError}`);
        }
    }, [loansError]);

    useEffect(() => {
        if (paymentsError) {
            const error = createError(
                ErrorType.DATA,
                `Payments error: ${paymentsError}`,
                undefined,
                'PAYMENTS_STATE_ERROR'
            );
            logError(error, 'GlobalErrorHandler');
            message.error(`Payments Error: ${paymentsError}`);
        }
    }, [paymentsError]);

    // Global error handler for unhandled promise rejections
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const error = createError(
                ErrorType.UNKNOWN,
                'Unhandled promise rejection',
                event.reason?.message || 'Unknown rejection reason',
                'UNHANDLED_PROMISE_REJECTION'
            );
            logError(error, 'GlobalErrorHandler');
            message.error('An unexpected error occurred. Please refresh the page.');
        };

        const handleError = (event: ErrorEvent) => {
            const error = createError(
                ErrorType.UNKNOWN,
                'Global error',
                event.message || 'Unknown error',
                'GLOBAL_ERROR'
            );
            logError(error, 'GlobalErrorHandler');
            message.error('An unexpected error occurred. Please refresh the page.');
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('error', handleError);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleError);
        };
    }, []);

    return null; // This component doesn't render anything
};
