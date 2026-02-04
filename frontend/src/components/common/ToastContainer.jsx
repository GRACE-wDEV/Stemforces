import { useToastStore } from '../../stores/toastStore';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast notification container - add to App.jsx
 */
export default function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onClick={() => dismissToast(toast.id)}
        >
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close">
            <X size={16} />
          </button>
        </div>
      ))}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 380px;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-success {
          border-left: 4px solid #10b981;
        }

        .toast-success .toast-icon {
          color: #10b981;
        }

        .toast-error {
          border-left: 4px solid #ef4444;
        }

        .toast-error .toast-icon {
          color: #ef4444;
        }

        .toast-warning {
          border-left: 4px solid #f59e0b;
        }

        .toast-warning .toast-icon {
          color: #f59e0b;
        }

        .toast-info {
          border-left: 4px solid #3b82f6;
        }

        .toast-info .toast-icon {
          color: #3b82f6;
        }

        .toast-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .toast-close {
          background: none;
          border: none;
          padding: 4px;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toast-close:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        @media (max-width: 480px) {
          .toast-container {
            left: 16px;
            right: 16px;
            bottom: 16px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
