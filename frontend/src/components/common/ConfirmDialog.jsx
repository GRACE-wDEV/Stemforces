import { X, AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel", 
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!open) return null;

  const getConfirmButtonClasses = () => {
    switch (confirmVariant) {
      case "destructive":
        return "btn btn-destructive";
      case "warning":
        return "btn bg-yellow-600 hover:bg-yellow-700 text-white";
      default:
        return "btn btn-primary";
    }
  };

  const getIconColor = () => {
    switch (confirmVariant) {
      case "destructive":
        return "text-red-600 dark:text-red-400";
      case "warning": 
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700`}>
                <AlertTriangle className={`w-6 h-6 ${getIconColor()}`} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message */}
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 btn btn-secondary disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 ${getConfirmButtonClasses()} disabled:opacity-50`}
            >
              {loading ? "Loading..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;