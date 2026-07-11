import { Component, type ErrorInfo, type ReactNode } from "react";

type AdminErrorBoundaryProps = {
  children: ReactNode;
};

type AdminErrorBoundaryState = {
  hasError: boolean;
};

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  state: AdminErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AdminErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Admin module render failure", { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          <h2 className="text-base font-semibold">Admin workspace error</h2>
          <p className="mt-2 text-sm">
            This admin view could not be rendered. Refresh the page or return to the dashboard.
          </p>
          <button
            className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800"
            type="button"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
