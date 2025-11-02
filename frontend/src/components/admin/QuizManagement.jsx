import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Users, Calendar, Play, Pause, AlertCircle, Clock, BookOpen, CheckCircle, XCircle, Filter, ChevronRight } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import axios from "../../api/axios";

const QuizManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [filters, setFilters] = useState({
    published: '',
    subject: ''
  });
  const searchInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Keyboard shortcut handler for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch quizzes from API
  const { data: quizzesData, isLoading, error } = useQuery({
    queryKey: ["admin-quizzes", searchTerm, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.published) params.append('published', filters.published);
      if (filters.subject) params.append('subject', filters.subject);
      
      const { data } = await axios.get(`/admin/quizzes?${params}`);
      return data;
    },
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId) => {
      await axios.delete(`/admin/quizzes/${quizId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-quizzes']);
    }
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ quizId, published }) => {
      const { data } = await axios.patch(`/admin/quizzes/${quizId}/publish`, { published });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-quizzes']);
    }
  });

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      deleteQuizMutation.mutate(quizId);
    }
  };

  const handleTogglePublish = (quiz) => {
    togglePublishMutation.mutate({
      quizId: quiz._id,
      published: !quiz.published
    });
  };

  const QuizCreationModal = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      subject: '',
      source: '',
      difficulty: 'Intermediate',
      duration: 30,
      selectedQuestions: []
    });

    // Fetch available questions for selection
    const { data: questionsData } = useQuery({
      queryKey: ["admin-questions-for-quiz", formData.subject, formData.difficulty],
      queryFn: async () => {
        if (!formData.subject) return { questions: [] };
        const params = new URLSearchParams();
        params.append('subject', formData.subject);
        params.append('difficulty', formData.difficulty);
        params.append('published', 'true');
        const { data } = await axios.get(`/admin/questions?${params}`);
        return data;
      },
      enabled: step === 2 && !!formData.subject
    });

    const createQuizMutation = useMutation({
      mutationFn: async (quizData) => {
        const payload = {
          title: quizData.title,
          description: quizData.description,
          subject: quizData.subject,
          source: quizData.source,
          total_time: quizData.duration,
          questions: quizData.selectedQuestions,
          published: false
        };

        const { data } = await axios.post('/admin/quizzes', payload);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-quizzes']);
        setShowQuickCreate(false);
        setStep(1);
        setFormData({
          title: '',
          description: '',
          subject: '',
          source: '',
          difficulty: 'Intermediate',
          duration: 30,
          selectedQuestions: []
        });
      }
    });

    const handleNext = () => {
      if (step === 1 && formData.title && formData.subject) {
        setStep(2);
      } else if (step === 2 && formData.selectedQuestions.length > 0) {
        createQuizMutation.mutate(formData);
      }
    };

    const toggleQuestion = (questionId) => {
      setFormData(prev => ({
        ...prev,
        selectedQuestions: prev.selectedQuestions.includes(questionId)
          ? prev.selectedQuestions.filter(id => id !== questionId)
          : [...prev.selectedQuestions, questionId]
      }));
    };

    if (!showQuickCreate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Quiz Collection - Step {step} of 2
            </h3>
            <button
              onClick={() => setShowQuickCreate(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quiz Collection Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Algebra Chapter 5 - Linear Equations"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of what this quiz covers..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select Subject</option>
                      <option value="Math">Math</option>
                      <option value="Arabic">Arabic</option>
                      <option value="English">English</option>
                      <option value="Science">Science</option>
                      <option value="Social Studies">Social Studies</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Source/Textbook
                    </label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="e.g., McGraw Hill Algebra 1, Chapter 5"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select Questions for "{formData.title}"
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose specific questions from {formData.subject} ({formData.difficulty} level)
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    Selected: {formData.selectedQuestions.length} questions
                  </p>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questionsData?.questions?.map((question) => (
                    <div
                      key={question._id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.selectedQuestions.includes(question._id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => toggleQuestion(question._id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={formData.selectedQuestions.includes(question._id)}
                          onChange={() => toggleQuestion(question._id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            {question.title}
                          </h5>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-x-4">
                            <span>Subject: {question.subject}</span>
                            <span>Difficulty: {question.difficulty}</span>
                            {question.source && <span>Source: {question.source}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {questionsData?.questions?.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No questions available for the selected criteria.
                      <br />
                      <span className="text-sm">Create questions first in the Questions tab.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => step === 1 ? setShowQuickCreate(false) : setStep(1)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={
                (step === 1 && (!formData.title || !formData.subject)) ||
                (step === 2 && formData.selectedQuestions.length === 0) ||
                createQuizMutation.isPending
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createQuizMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : step === 1 ? (
                <>
                  Next: Select Questions
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const quizzes = quizzesData?.quizzes || [];
  
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quiz Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Loading quizzes...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quiz Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load quizzes
          </p>
        </div>
        <div className="card">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Quizzes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.response?.status === 401 
                ? "Authentication required - please login as admin/editor"
                : error.response?.status === 403
                ? "Access denied - admin/editor role required"
                : error.response?.data?.message || "Unable to fetch quiz data"}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quiz Collections
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage subject-based quiz collections from your question bank
          </p>
        </div>
        
        <button 
          onClick={() => setShowQuickCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Quiz Collection
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search quizzes..."
              className="w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                  Ctrl K
                </kbd>
            </div>
          </div>
          <select
            value={filters.published}
            onChange={(e) => setFilters({ ...filters, published: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Subjects</option>
            <option value="Math">Math</option>
            <option value="Arabic">Arabic</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
            <option value="Social Studies">Social Studies</option>
          </select>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <QuizCard 
            key={quiz._id} 
            quiz={quiz} 
            onDelete={handleDeleteQuiz}
            onTogglePublish={handleTogglePublish}
          />
        ))}
        
        {filteredQuizzes.length === 0 && quizzes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No quizzes found.
            </p>
            <p className="text-sm text-gray-400">
              Create your first quiz to get started.
            </p>
          </div>
        )}
        
        {filteredQuizzes.length === 0 && quizzes.length > 0 && (
          <div className="col-span-full text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No quizzes match your search criteria.
            </p>
          </div>
        )}
      </div>

      <QuizCreationModal />
    </div>
  );
};

const QuizCard = ({ quiz, onDelete, onTogglePublish }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {quiz.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {quiz.subject || 'No Subject'}
          </p>
        </div>
        <button
          onClick={() => onTogglePublish(quiz)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            quiz.published
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}
        >
          {quiz.published ? (
            <>
              <CheckCircle size={12} className="mr-1" />
              Published
            </>
          ) : (
            <>
              <XCircle size={12} className="mr-1" />
              Draft
            </>
          )}
        </button>
      </div>

      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {quiz.description || 'No description available'}
      </p>
      
      {quiz.source && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mb-3 font-medium">
          📚 Source: {quiz.source}
        </div>
      )}

      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 space-x-4">
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-1" />
          {quiz.questions?.length || 0} questions
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {quiz.total_time || 60}m
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {quiz.attempts_count || 0} attempts
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-slate-600 dark:text-slate-400">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(quiz._id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(quiz.createdAt).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            by {quiz.created_by?.name || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;