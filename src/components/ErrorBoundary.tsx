import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result } from 'antd';
import { PrimaryButton } from './ui/Button';
import { createError, ErrorType, logError } from '../utils/errorHandling';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const appError = createError(
            ErrorType.UNKNOWN,
            error.message,
            errorInfo.componentStack || undefined,
            'ERROR_BOUNDARY'
        );

        logError(appError, 'ErrorBoundary');

        this.setState({ error, errorInfo });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Result
                    status="error"
                    title="Something went wrong"
                    subTitle="An unexpected error occurred. Please try refreshing the page."
                    extra={[
                        <PrimaryButton key="retry" onClick={this.handleRetry}>
                            Try Again
                        </PrimaryButton>,
                        <PrimaryButton key="refresh" onClick={() => window.location.reload()}>
                            Refresh Page
                        </PrimaryButton>,
                    ]}
                >
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
                            <summary>Error Details (Development Only)</summary>
                            <p><strong>Error:</strong> {this.state.error.message}</p>
                            <p><strong>Stack:</strong> {this.state.error.stack}</p>
                            {this.state.errorInfo && (
                                <p><strong>Component Stack:</strong> {this.state.errorInfo.componentStack}</p>
                            )}
                        </details>
                    )}
                </Result>
            );
        }

        return this.props.children;
    }
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}
