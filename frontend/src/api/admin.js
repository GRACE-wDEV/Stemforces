import api from "./axios.js";

// Dashboard APIs
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard/stats"),

  // Questions Management
  getQuestions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/questions?${queryString}`);
  },

  createQuestion: (questionData) => api.post("/admin/questions", questionData),

  updateQuestion: (id, questionData) => api.put(`/admin/questions/${id}`, questionData),

  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),

  restoreQuestion: (id) => api.post(`/admin/questions/${id}/restore`),

  bulkOperations: (data) => api.post("/admin/questions/bulk", data),

  importQuestions: (data) => api.post("/admin/questions/import", data),

  exportQuestions: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/questions/export?${queryString}`, {
      responseType: 'blob' // For file downloads
    });
  },

  // Quiz Management
  getQuizzes: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/admin/quizzes?${queryString}`);
  },

  getQuizById: (id) => api.get(`/admin/quizzes/${id}`),

  createQuiz: (quizData) => api.post("/admin/quizzes", quizData),

  updateQuiz: (id, quizData) => api.put(`/admin/quizzes/${id}`, quizData),

  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),

  publishQuiz: (id, published) => 
    api.patch(`/admin/quizzes/${id}/publish`, { published }),

  // Subjects (if needed)
  getSubjects: () => api.get("/subjects"),
  
  // Users (for admin user management)
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/auth/users`);
  },

  updateUserRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  
  toggleUserStatus: (id, active) => api.patch(`/users/${id}/status`, { active }),
};