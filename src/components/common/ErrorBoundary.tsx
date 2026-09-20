import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TRACE ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-semibold text-stone-100">Temporary Display Issue</h1>
            <p className="text-xs text-stone-400 leading-relaxed">
              TRACE encountered an unexpected rendering condition while parsing visual representations. Your uploaded data remains intact locally.
            </p>
            {this.state.error && (
              <pre className="text-[11px] font-mono bg-stone-950 p-3 rounded text-amber-300 text-left overflow-x-auto max-h-32 border border-stone-800/80">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload TRACE Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
