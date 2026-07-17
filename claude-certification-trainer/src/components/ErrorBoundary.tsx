import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './ui';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface for debugging; never swallow silently.
    console.error('Unhandled error in UI:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="max-w-md rounded-xl border border-line bg-surface-raised p-6 text-center">
            <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-muted">
              An unexpected error occurred while rendering this view. Your saved progress is safe in local storage.
            </p>
            <pre className="mt-3 max-h-32 overflow-auto rounded bg-surface-sunken p-2 text-left text-xs text-danger">
              {this.state.error.message}
            </pre>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="primary" onClick={() => this.setState({ error: null })}>
                Try again
              </Button>
              <Button onClick={() => (window.location.href = '/')}>Go to dashboard</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
