import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-slate-100 mb-2">Oops! Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
