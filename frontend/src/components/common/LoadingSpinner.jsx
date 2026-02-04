const LoadingSpinner = ({ size = "md", className = "", fullScreen = false, message = null }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const spinner = (
    <div className="spinner-container">
      <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
        <svg
          className="w-full h-full text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {message && <p className="spinner-message">{message}</p>}
      <style>{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .spinner-message {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary, #666);
          text-align: center;
        }
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          z-index: 9999;
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return <div className="loading-overlay">{spinner}</div>;
  }

  return spinner;
};

export default LoadingSpinner;