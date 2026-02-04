import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Mark error boundary state; also log for easier debugging
    // Note: avoid throwing from this lifecycle
    try {
      console.error('ErrorBoundary captured error:', error?.toString ? error.toString() : error);
    } catch {
      // ignore logging errors
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // Log to error tracking service (e.g., Sentry)
    if (window.errorTracker) {
      window.errorTracker.captureException(error, { errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <AlertTriangle size={64} color="#ef4444" />
            </div>
            <h1 className="error-title">Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
            
                  {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button 
                className="btn-primary error-btn" 
                onClick={this.handleReset}
              >
                <RefreshCw size={20} />
                Reload Page
              </button>
              <button 
                className="btn-secondary error-btn" 
                onClick={this.handleGoHome}
              >
                <Home size={20} />
                Go to Home
              </button>
            </div>
          </div>

          <style>{`
            .error-boundary-container {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 24px;
              background: var(--bg-primary, #ffffff);
            }

            .error-boundary-content {
              max-width: 600px;
              text-align: center;
            }

            .error-icon {
              margin-bottom: 24px;
              animation: shake 0.5s ease-in-out;
            }

            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-10px); }
              75% { transform: translateX(10px); }
            }

            .error-title {
              font-size: 28px;
              font-weight: 700;
              color: var(--text-primary, #1a1a1a);
              margin-bottom: 12px;
            }

            .error-message {
              font-size: 16px;
              color: var(--text-secondary, #666);
              margin-bottom: 32px;
              line-height: 1.6;
            }

            .error-details {
              text-align: left;
              margin: 24px 0;
              padding: 16px;
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #374151;
              margin-bottom: 12px;
            }

            .error-stack {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #dc2626;
              overflow-x: auto;
              white-space: pre-wrap;
              word-wrap: break-word;
            }

            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              flex-wrap: wrap;
            }

            .error-btn {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 12px 24px;
              font-size: 16px;
              font-weight: 600;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
            }

            .btn-primary.error-btn {
              background: linear-gradient(135deg, #6366f1, #a855f7);
              color: white;
            }

            .btn-primary.error-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
            }

            .btn-secondary.error-btn {
              background: white;
              color: #6366f1;
              border: 2px solid #6366f1;
            }

            .btn-secondary.error-btn:hover {
              background: #f5f3ff;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
