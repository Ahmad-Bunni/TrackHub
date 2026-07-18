import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("React ErrorBoundary caught:", error, info);
    try {
      window.electron.logRendererError({
        message: error.message,
        stack: error.stack + "\n\n" + info.componentStack,
      });
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: "monospace",
            color: "#ff4444",
            backgroundColor: "#1a1a2e",
            minHeight: "100vh",
          }}
        >
          <h2 style={{ margin: "0 0 12px" }}>Application Error</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontSize: 13,
              backgroundColor: "#16213e",
              padding: 12,
              borderRadius: 4,
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {this.state.error?.message}
            {"\n"}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
