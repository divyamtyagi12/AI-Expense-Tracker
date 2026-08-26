// frontend/src/components/ErrorBanner.jsx
// Simple, reusable error display. Returns null if there's no message,
// so callers can render it unconditionally: <ErrorBanner message={error} />

function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div role="alert" className="error-banner">
      {message}
    </div>
  );
}

export default ErrorBanner;
