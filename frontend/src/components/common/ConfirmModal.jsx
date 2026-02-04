import { AlertTriangle, CheckCircle, X } from 'lucide-react';

/**
 * Confirmation Modal Component
 * 
 * Usage:
 * <ConfirmModal
 *   isOpen={showConfirm}
 *   title="Submit Quiz?"
 *   message="Are you sure you want to submit?"
 *   confirmText="Submit"
 *   cancelText="Cancel"
 *   type="warning"
 *   onConfirm={() => handleSubmit()}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'success'
  onConfirm,
  onCancel,
  children
}) {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: <AlertTriangle size={32} />,
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      btnClass: 'btn-warning'
    },
    danger: {
      icon: <AlertTriangle size={32} />,
      iconBg: '#fee2e2',
      iconColor: '#ef4444',
      btnClass: 'btn-danger'
    },
    success: {
      icon: <CheckCircle size={32} />,
      iconBg: '#dcfce7',
      iconColor: '#10b981',
      btnClass: 'btn-success'
    }
  };

  const style = typeStyles[type] || typeStyles.warning;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>
          <X size={20} />
        </button>

        <div className="modal-icon" style={{ background: style.iconBg, color: style.iconColor }}>
          {style.icon}
        </div>

        <h2 className="modal-title">{title}</h2>
        
        {message && <p className="modal-message">{message}</p>}
        
        {children}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${style.btnClass}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 32px;
          max-width: 420px;
          width: 90%;
          text-align: center;
          position: relative;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
        }

        .modal-close:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .modal-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 8px;
          color: var(--text-primary);
        }

        .modal-message {
          color: var(--text-secondary);
          margin: 0 0 24px;
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .modal-actions .btn {
          min-width: 100px;
          padding: 12px 24px;
        }

        .btn-warning {
          background: #f59e0b;
          color: white;
          border: none;
        }

        .btn-warning:hover {
          background: #d97706;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
          border: none;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-success {
          background: #10b981;
          color: white;
          border: none;
        }

        .btn-success:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}
