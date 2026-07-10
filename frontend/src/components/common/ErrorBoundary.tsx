import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorState } from "@/components/common/ErrorState";

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Application error boundary", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState title="Application error" message="Refresh the page or contact support if it continues." />;
    }

    return this.props.children;
  }
}
