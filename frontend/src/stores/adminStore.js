import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminStore = create(
  persist(
    (set, get) => ({
      dashboardStats: null,
      questions: [],
      quizzes: [],
      selectedQuestions: [],
      filters: {
        search: '',
        subject: '',
        difficulty: '',
        published: '',
        tags: [],
        created_by: '',
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
      loading: {
        dashboard: false,
        questions: false,
        quizzes: false,
        bulk: false,
        import: false,
        export: false,
      },
      errors: {},
      
      // UI state
      showDeletedQuestions: false,
      bulkMode: false,
      previewQuestion: null,
      
      // actions - loading
      setLoading: (key, isLoading) => {
        set((state) => ({
          loading: { ...state.loading, [key]: isLoading }
        }));
      },

      // actions - errors
      setError: (key, error) => {
        set((state) => ({
          errors: { ...state.errors, [key]: error }
        }));
      },
      clearError: (key) => {
        set((state) => ({
          errors: { ...state.errors, [key]: null }
        }));
      },
      clearAllErrors: () => {
        set({ errors: {} });
      },

      // actions - dashboard
      setDashboardStats: (stats) => {
        set({ dashboardStats: stats });
      },

      // actions - questions
      setQuestions: (questions) => {
        set({ questions });
      },
      addQuestion: (question) => {
        set((state) => ({
          questions: [question, ...state.questions]
        }));
      },
      updateQuestion: (questionId, updates) => {
        set((state) => ({
          questions: state.questions.map((q) =>
            q._id === questionId ? { ...q, ...updates } : q
          )
        }));
      },
      removeQuestion: (questionId) => {
        set((state) => ({
          questions: state.questions.filter((q) => q._id !== questionId)
        }));
      },

      // actions - question selection
      selectQuestion: (questionId) => {
        set((state) => ({
          selectedQuestions: [...state.selectedQuestions, questionId]
        }));
      },
      deselectQuestion: (questionId) => {
        set((state) => ({
          selectedQuestions: state.selectedQuestions.filter(id => id !== questionId)
        }));
      },
      selectAllQuestions: () => {
        const { questions } = get();
        set({ selectedQuestions: questions.map(q => q._id) });
      },
      deselectAllQuestions: () => {
        set({ selectedQuestions: [] });
      },
      toggleQuestionSelection: (questionId) => {
        const { selectedQuestions } = get();
        if (selectedQuestions.includes(questionId)) {
          get().deselectQuestion(questionId);
        } else {
          get().selectQuestion(questionId);
        }
      },

      // actions - filters
      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
          pagination: { ...state.pagination, page: 1 } // Reset page when filtering
        }));
      },
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
          pagination: { ...state.pagination, page: 1 }
        }));
      },
      resetFilters: () => {
        set({
          filters: {
            search: '',
            subject: '',
            difficulty: '',
            published: null,
            tags: [],
            created_by: '',
          },
          pagination: { ...get().pagination, page: 1 }
        });
      },

      // actions - pagination
      setPagination: (pagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...pagination }
        }));
      },
      setPage: (page) => {
        set((state) => ({
          pagination: { ...state.pagination, page }
        }));
      },

      // actions - quizzes
      setQuizzes: (quizzes) => {
        set({ quizzes });
      },
      addQuiz: (quiz) => {
        set((state) => ({
          quizzes: [quiz, ...state.quizzes]
        }));
      },
      updateQuiz: (quizId, updates) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q._id === quizId ? { ...q, ...updates } : q
          )
        }));
      },
      removeQuiz: (quizId) => {
        set((state) => ({
          quizzes: state.quizzes.filter((q) => q._id !== quizId)
        }));
      },

      // actions - UI
      toggleBulkMode: () => {
        set((state) => ({
          bulkMode: !state.bulkMode,
          selectedQuestions: [] // clear selection when toggling
        }));
      },
      setShowDeletedQuestions: (show) => {
        set({ showDeletedQuestions: show });
      },
      setPreviewQuestion: (question) => {
        set({ previewQuestion: question });
      },

      // computed values
      isQuestionSelected: (questionId) => {
        const { selectedQuestions } = get();
        return selectedQuestions.includes(questionId);
      },
      getSelectedQuestionsCount: () => {
        return get().selectedQuestions.length;
      },
      getAllQuestionsSelected: () => {
        const { questions, selectedQuestions } = get();
        return questions.length > 0 && selectedQuestions.length === questions.length;
      },
      getSomeQuestionsSelected: () => {
        const { selectedQuestions } = get();
        return selectedQuestions.length > 0;
      },

      // filter helpers
      getFilteredQuestionsCount: () => {
        const { questions } = get();
        // This would be calculated on the backend, but for UI purposes:
        return questions.length;
      },
      
      // stats helpers
      getQuestionStats: () => {
        const { dashboardStats } = get();
        return dashboardStats || {
          total_questions: 0,
          published_questions: 0,
          draft_questions: 0
        };
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        filters: state.filters,
        pagination: state.pagination,
        showDeletedQuestions: state.showDeletedQuestions,
      }),
    }
  )
);