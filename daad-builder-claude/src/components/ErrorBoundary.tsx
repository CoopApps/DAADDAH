import React, { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: 24,
            backgroundColor: "var(--bg-dark)",
            border: "2px solid var(--red-bright)",
            borderRadius: 8,
            margin: 16,
          }}
        >
          <h2 style={{ color: "var(--red-bright)", marginTop: 0 }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--text-dim)" }}>
            An error occurred while rendering this component.
          </p>
          {this.state.error && (
            <details style={{ marginTop: 16 }}>
              <summary style={{ cursor: "pointer", color: "var(--text-dim)" }}>
                Error details
              </summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: "var(--bg-medium)",
                  borderRadius: 4,
                  fontSize: 12,
                  overflow: "auto",
                  maxHeight: 300,
                }}
              >
                {this.state.error.toString()}
                {"\n\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            className="btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{ marginTop: 16 }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
