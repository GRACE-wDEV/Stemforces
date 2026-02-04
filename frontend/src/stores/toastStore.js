import { create } from 'zustand';

/**
 * Toast notification store
 * Usage:
 *   import { useToast } from '../stores/toastStore';
 *   const { showToast } = useToast();
 *   showToast('Success!', 'success');
 */

export const useToastStore = create((set, get) => ({
  toasts: [],
  
  showToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    set(state => ({
      toasts: [...state.toasts, toast]
    }));
    
    // Auto-dismiss
    setTimeout(() => {
      set(state => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, duration);
    
    return id;
  },
  
  dismissToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },
  
  // Convenience methods
  success: (message, duration) => get().showToast(message, 'success', duration),
  error: (message, duration) => get().showToast(message, 'error', duration || 5000),
  warning: (message, duration) => get().showToast(message, 'warning', duration),
  info: (message, duration) => get().showToast(message, 'info', duration)
}));

// Hook for components
export const useToast = () => {
  const { showToast, success, error, warning, info, dismissToast } = useToastStore();
  return { showToast, success, error, warning, info, dismissToast };
};
