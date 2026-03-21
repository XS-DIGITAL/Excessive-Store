import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let errorDetails: any = null;

      try {
        // Check if the error is a JSON string from handleFirestoreError
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = `Database Error: ${parsed.error}`;
            errorDetails = parsed;
          }
        }
      } catch (e) {
        // Not a JSON error, use the raw message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-black uppercase italic">Something went wrong</h1>
              <p className="text-text-secondary text-sm">
                {errorMessage}
              </p>
            </div>

            {errorDetails && (
              <div className="p-4 bg-black/20 rounded-xl text-left space-y-2 overflow-hidden">
                <p className="text-[10px] font-bold uppercase text-text-muted tracking-widest">Error Context</p>
                <div className="text-[10px] font-mono text-text-secondary break-all">
                  <p>Operation: {errorDetails.operationType}</p>
                  <p>Path: {errorDetails.path}</p>
                  <p>User ID: {errorDetails.authInfo?.userId || 'Not Authenticated'}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={this.handleReset}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              <a 
                href="/"
                className="btn-secondary w-full py-4 flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
