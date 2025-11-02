import { create } from 'zustand';

export const useLeaderboardStore = create((set, get) => ({
  // State
  leaderboard: [],
  userRank: null,
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  setLeaderboard: (data) => {
    set({ 
      leaderboard: data,
      lastUpdated: new Date().toISOString(),
    });
  },

  setUserRank: (rank) => {
    set({ userRank: rank });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  updateUserScore: (userId, newScore) => {
    set((state) => ({
      leaderboard: state.leaderboard.map((user) =>
        user._id === userId ? { ...user, score: newScore } : user
      ).sort((a, b) => b.score - a.score), // Re-sort after update
    }));
  },

  // Computed values
  getTopUsers: (count = 3) => {
    const { leaderboard } = get();
    return leaderboard.slice(0, count);
  },

  getUserPosition: (userId) => {
    const { leaderboard } = get();
    const index = leaderboard.findIndex((user) => user._id === userId);
    return index !== -1 ? index + 1 : null;
  },

  getUserScore: (userId) => {
    const { leaderboard } = get();
    const user = leaderboard.find((user) => user._id === userId);
    return user?.score || 0;
  },

  getTotalUsers: () => {
    return get().leaderboard.length;
  },

  isInTop10: (userId) => {
    const position = get().getUserPosition(userId);
    return position && position <= 10;
  },

  getPercentile: (userId) => {
    const position = get().getUserPosition(userId);
    const total = get().getTotalUsers();
    if (!position || total === 0) return 0;
    return Math.round(((total - position) / total) * 100);
  },
}));