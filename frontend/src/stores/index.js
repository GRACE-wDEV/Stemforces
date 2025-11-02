// Export all stores
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useQuestionsStore } from './questionsStore';
export { useLeaderboardStore } from './leaderboardStore';

// Store selectors for better performance
export const authSelectors = {
  user: (state) => state.user,
  isAuthenticated: (state) => state.isAuthenticated,
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
};

export const uiSelectors = {
  theme: (state) => state.theme,
  sidebarOpen: (state) => state.sidebarOpen,
  notifications: (state) => state.notifications,
};

export const questionsSelectors = {
  questions: (state) => state.questions,
  currentQuestion: (state) => state.currentQuestion,
  filters: (state) => state.filters,
  pagination: (state) => state.pagination,
  loading: (state) => state.loading,
};

export const leaderboardSelectors = {
  leaderboard: (state) => state.leaderboard,
  loading: (state) => state.loading,
  error: (state) => state.error,
};