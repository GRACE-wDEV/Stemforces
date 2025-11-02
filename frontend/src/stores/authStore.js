import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (userData) => {
        set({ 
          user: userData,
          token: userData.token,
          isAuthenticated: true, 
          error: null 
        });
      },

      logout: () => {
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false, 
          error: null 
        });
      },

      setUser: (userData) => {
        set({ user: userData });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...updates } 
          });
        }
      },

      getUserName: () => {
        const { user } = get();
        return user?.name || 'Guest';
      },

      getUserScore: () => {
        const { user } = get();
        return user?.score || 0;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      getToken: () => {
        const { token } = get();
        return token;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
