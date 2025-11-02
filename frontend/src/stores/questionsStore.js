import { create } from 'zustand';

export const useQuestionsStore = create((set, get) => ({
  // State
  questions: [],
  currentQuestion: null,
  selectedAnswers: {},
  filters: {
    subject: '',
    source: '',
    difficulty: '',
    keyword: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,

  // Actions
  setQuestions: (questions) => {
    set({ questions });
  },

  addQuestions: (newQuestions) => {
    set((state) => ({
      questions: [...state.questions, ...newQuestions],
    }));
  },

  setCurrentQuestion: (question) => {
    set({ currentQuestion: question });
  },

  setSelectedAnswer: (questionId, answer) => {
    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionId]: answer,
      },
    }));
  },

  getSelectedAnswer: (questionId) => {
    return get().selectedAnswers[questionId];
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  resetFilters: () => {
    set({
      filters: {
        subject: '',
        source: '',
        difficulty: '',
        keyword: '',
      },
    });
  },

  setPagination: (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    }));
  },

  nextPage: () => {
    const { pagination } = get();
    if (pagination.page < pagination.pages) {
      set((state) => ({
        pagination: { ...state.pagination, page: state.pagination.page + 1 },
      }));
    }
  },

  prevPage: () => {
    const { pagination } = get();
    if (pagination.page > 1) {
      set((state) => ({
        pagination: { ...state.pagination, page: state.pagination.page - 1 },
      }));
    }
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
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

  // Computed values
  getFilteredQuestions: () => {
    const { questions, filters } = get();
    return questions.filter((question) => {
      if (filters.subject && question.subject !== filters.subject) return false;
      if (filters.source && question.source !== filters.source) return false;
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
      if (filters.keyword && !question.text.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      return true;
    });
  },

  getQuestionsBySubject: (subject) => {
    const { questions } = get();
    return questions.filter((question) => question.subject === subject);
  },

  getAnsweredQuestions: () => {
    const { selectedAnswers } = get();
    return Object.keys(selectedAnswers).length;
  },

  getCorrectAnswers: () => {
    const { questions, selectedAnswers } = get();
    let correct = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question._id] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  },

  getAccuracy: () => {
    const answered = get().getAnsweredQuestions();
    const correct = get().getCorrectAnswers();
    return answered > 0 ? Math.round((correct / answered) * 100) : 0;
  },
}));