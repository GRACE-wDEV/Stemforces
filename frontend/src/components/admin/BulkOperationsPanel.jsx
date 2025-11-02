import { useState } from "react";
import { X, Trash2, Archive, Eye, EyeOff, Download, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminAPI } from "../../api/admin.js";
import { useAdminStore } from "../../stores/adminStore.js";

const BulkOperationsPanel = ({ selectedQuestions, onClose, onComplete }) => {
  const [confirmDialog, setConfirmDialog] = useState({ open: false, operation: null });
  const { clearSelections } = useAdminStore();

  const operations = [
    {
      id: "publish",
      label: "Publish Questions",
      icon: Eye,
      description: "Make selected questions visible to users",
      variant: "success",
    },
    {
      id: "unpublish", 
      label: "Unpublish Questions",
      icon: EyeOff,
      description: "Hide selected questions from users",
      variant: "warning",
    },
    {
      id: "archive",
      label: "Archive Questions",
      icon: Archive,
      description: "Move selected questions to archive",
      variant: "secondary",
    },
    {
      id: "delete",
      label: "Delete Questions",
      icon: Trash2,
      description: "Permanently delete selected questions",
      variant: "destructive",
    },
    {
      id: "export",
      label: "Export Questions",
      icon: Download,
      description: "Download selected questions as JSON",
      variant: "primary",
    },
  ];

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ operation, questionIds }) => {
      switch (operation) {
        case "publish":
          return adminAPI.bulkOperations({ 
            action: "publish", 
            questionIds 
          });
        case "unpublish":
          return adminAPI.bulkOperations({ 
            action: "unpublish", 
            questionIds 
          });
        case "archive":
          return adminAPI.bulkOperations({ 
            action: "archive", 
            questionIds 
          });
        case "delete":
          return adminAPI.bulkOperations({ 
            action: "delete", 
            questionIds 
          });
        case "export":
          return adminAPI.exportQuestions({ questionIds });
        default:
          throw new Error("Unknown operation");
      }
    },
    onSuccess: (_, { operation }) => {
      const operationLabels = {
        publish: "published",
        unpublish: "unpublished",
        archive: "archived", 
        delete: "deleted",
        export: "exported",
      };
      
      toast.success(
        `${selectedQuestions.length} questions ${operationLabels[operation]} successfully`
      );
      
      clearSelections();
      onComplete();
    },
    onError: (error, { operation }) => {
      toast.error(
        error.response?.data?.message || `Failed to ${operation} questions`
      );
    },
  });

  const handleOperation = (operation) => {
    if (operation === "delete") {
      setConfirmDialog({ open: true, operation });
    } else if (operation === "export") {
      handleExport();
    } else {
      bulkUpdateMutation.mutate({ operation, questionIds: selectedQuestions });
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminAPI.exportQuestions({ questionIds: selectedQuestions });
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `questions-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Questions exported successfully");
      onComplete();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export questions");
    }
  };

  const confirmOperation = () => {
    if (confirmDialog.operation) {
      bulkUpdateMutation.mutate({
        operation: confirmDialog.operation,
        questionIds: selectedQuestions,
      });
      setConfirmDialog({ open: false, operation: null });
    }
  };

  const getVariantClasses = (variant) => {
    switch (variant) {
      case "success":
        return "border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20";
      case "warning":
        return "border-yellow-300 hover:bg-yellow-50 dark:border-yellow-700 dark:hover:bg-yellow-900/20";
      case "destructive":
        return "border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20";
      case "primary":
        return "border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20";
      default:
        return "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50";
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Bulk Operations
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Operations */}
          <div className="p-6 space-y-3">
            {operations.map((operation) => {
              const Icon = operation.icon;
              return (
                <button
                  key={operation.id}
                  onClick={() => handleOperation(operation.id)}
                  disabled={bulkUpdateMutation.isLoading}
                  className={`w-full flex items-center space-x-4 p-4 border-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses(
                    operation.variant
                  )}`}
                >
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {operation.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {operation.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Confirm Deletion
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to permanently delete{" "}
                <strong>{selectedQuestions.length}</strong> question
                {selectedQuestions.length !== 1 ? "s" : ""}?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmDialog({ open: false, operation: null })}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOperation}
                  disabled={bulkUpdateMutation.isLoading}
                  className="flex-1 btn btn-destructive"
                >
                  {bulkUpdateMutation.isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkOperationsPanel;