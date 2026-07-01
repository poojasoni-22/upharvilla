"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <span className="text-red-500 text-xl">!</span>
            </div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-1">
              Something went wrong
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs">
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
