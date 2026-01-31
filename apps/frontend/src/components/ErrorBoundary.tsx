import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<FallbackProps>;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export interface FallbackProps {
    error: Error | null;
    resetError: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details in development
        if (import.meta.env.DEV) {
            console.group('🔴 Error Boundary Caught');
            console.error('Error:', error);
            console.error('Component Stack:', errorInfo.componentStack);
            console.groupEnd();
        } else {
            // In production, log minimal info
            console.error('An error occurred. Please contact support if the problem persists.');
        }
    }

    resetErrorBoundary = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            const Fallback = this.props.fallback || DefaultErrorFallback;
            return <Fallback error={this.state.error} resetError={this.resetErrorBoundary} />;
        }

        return this.props.children;
    }
}

// Default fallback component
const DefaultErrorFallback: React.FC<FallbackProps> = ({ error, resetError }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: 'var(--space-6)',
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>🚨</div>
            <h2 style={{ margin: '0 0 var(--space-3) 0', color: 'var(--text-main)' }}>
                Something went wrong
            </h2>
            <p style={{ margin: '0 0 var(--space-6) 0', color: 'var(--text-muted)', maxWidth: '500px' }}>
                We're having trouble loading this page. Please try again or return to the dashboard.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    onClick={resetError}
                    style={{
                        padding: 'var(--space-3) var(--space-5)',
                        backgroundColor: 'var(--color-primary-600)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--border-radius-md)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-body)',
                        fontWeight: 600
                    }}
                >
                    Try Again
                </button>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    style={{
                        padding: 'var(--space-3) var(--space-5)',
                        backgroundColor: 'transparent',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--border-radius-md)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-body)',
                        fontWeight: 600
                    }}
                >
                    Go to Dashboard
                </button>
            </div>

            {import.meta.env.DEV && error && (
                <details style={{
                    marginTop: 'var(--space-8)',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderRadius: 'var(--border-radius-md)',
                    maxWidth: '800px',
                    width: '100%',
                    textAlign: 'left'
                }}>
                    <summary style={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        color: 'var(--color-error-700)',
                        marginBottom: 'var(--space-2)'
                    }}>
                        Error Details (Dev Only)
                    </summary>
                    <pre style={{
                        fontSize: 'var(--font-size-caption)',
                        overflow: 'auto',
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-sm)',
                        margin: 'var(--space-2) 0'
                    }}>
                        {error.message}
                    </pre>
                    <pre style={{
                        fontSize: 'var(--font-size-caption)',
                        overflow: 'auto',
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius-sm)',
                        margin: 0
                    }}>
                        {error.stack}
                    </pre>
                </details>
            )}
        </div>
    );
};

export default ErrorBoundary;
