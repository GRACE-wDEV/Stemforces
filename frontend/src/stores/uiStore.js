import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // State
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
  loading: {},
  modals: {},

  // Theme Actions
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  // Sidebar Actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  // Loading Actions
  setLoading: (key, isLoading) => {
    set((state) => ({
      loading: {
        ...state.loading,
        [key]: isLoading,
      },
    }));
  },

  isLoading: (key) => {
    return get().loading[key] || false;
  },

  // Modal Actions
  openModal: (modalId, data = null) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: { isOpen: true, data },
      },
    }));
  },

  closeModal: (modalId) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: { isOpen: false, data: null },
      },
    }));
  },

  isModalOpen: (modalId) => {
    return get().modals[modalId]?.isOpen || false;
  },

  getModalData: (modalId) => {
    return get().modals[modalId]?.data || null;
  },

  // Notification Actions
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto remove notification
    setTimeout(() => {
      get().removeNotification(id);
    }, newNotification.duration);

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));