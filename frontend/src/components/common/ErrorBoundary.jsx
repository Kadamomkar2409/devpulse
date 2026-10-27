import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-box" id="error-boundary-fallback">
          <AlertTriangle size={36} color="#f43f5e" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            Application Error Caught
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred in the component tree.'}
          </p>
          <button className="btn-primary" onClick={this.handleReset}>
            <RefreshCw size={14} /> Reload Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
