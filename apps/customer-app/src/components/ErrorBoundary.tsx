import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('App error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="paper-bg flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="font-display text-2xl text-burgundy">Something went wrong</p>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            The page hit an unexpected error. Reload to try again.
          </p>
          <button
            type="button"
            className="btn-pill btn-clay mt-6"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
