import React from "react";
import SystemFailure from "./SystemFailure";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to Sentry, Firebase Crashlytics, etc. here
    console.error("Discotive Error Boundary Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SystemFailure
          errorType="RUNTIME_EXCEPTION"
          errorMessage={this.state.error?.toString()}
          resetBoundary={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
