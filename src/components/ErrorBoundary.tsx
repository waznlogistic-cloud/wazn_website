import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            textAlign: "center",
            fontFamily: "Tajawal, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
            حدث خطأ في التطبيق
          </h1>
          <p style={{ marginBottom: "16px", color: "#666" }}>
            {this.state.error?.message || "حدث خطأ غير متوقع"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              backgroundColor: "#6E69D1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            إعادة تحميل الصفحة
          </button>
          {import.meta.env.DEV && (
            <details style={{ marginTop: "20px", textAlign: "left", maxWidth: "600px" }}>
              <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
                تفاصيل الخطأ (للمطورين)
              </summary>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "16px",
                  borderRadius: "8px",
                  overflow: "auto",
                  fontSize: "12px",
                }}
              >
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

