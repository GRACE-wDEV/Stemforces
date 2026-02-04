import api from "./axios.js";

export const adminAPI = {
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
      responseType: 'blob'
    });
  },

  // Image Upload
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  deleteImage: (filename) => api.delete(`/upload/image/${filename}`),

  // Category Management
  getCategories: (subject) => {
    const params = subject ? `?subject=${subject}` : '';
    return api.get(`/categories${params}`);
  },

  createCategory: (categoryData) => api.post("/categories", categoryData),

  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),

  deleteCategory: (id) => api.delete(`/categories/${id}`),

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

  // Subjects
  getSubjects: () => api.get("/home/subjects"),
  
  // Users
  getUsers: () => api.get(`/auth/users`),

  updateUserRole: (id, role) => api.patch(`/auth/users/${id}/role`, { role }),
  
  toggleUserStatus: (id, active) => api.patch(`/auth/users/${id}/status`, { active }),
};