import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.navigate) {
            this.props.navigate('/app/admin/dashboard');
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        maxWidth: '500px'
                    }}>
                        <h1 style={{ color: '#dc3545', marginBottom: '16px' }}>
                            Something went wrong
                        </h1>
                        <p style={{ color: '#6c757d', marginBottom: '24px' }}>
                            We're sorry, but an unexpected error occurred in the application.
                        </p>
                        {this.state.error && (
                            <pre style={{
                                backgroundColor: '#f8f9fa',
                                padding: '16px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#dc3545',
                                marginBottom: '24px',
                                overflow: 'auto',
                                maxHeight: '200px'
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        )}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button 
                                onClick={this.handleReset}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                Try Again
                            </button>
                            <button 
                                onClick={this.handleGoHome}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrapper component to provide navigate function
export default function ErrorBoundaryWrapper(props) {
    const navigate = useNavigate();
    return <ErrorBoundary {...props} navigate={navigate} />;
}
