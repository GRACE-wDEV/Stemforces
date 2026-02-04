import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderOpen,
  Plus,
  FileText,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Upload,
  ChevronRight,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  Sparkles,
  Copy,
  CheckCircle2,
  ListPlus,
  Layers,
  Target
} from "lucide-react";
import { adminAPI } from "../api/admin";

const SUBJECTS = [
  { id: "Math", name: "Mathematics", icon: "📐", color: "#3b82f6" },
  { id: "Physics", name: "Physics", icon: "⚡", color: "#8b5cf6" },
  { id: "Chemistry", name: "Chemistry", icon: "🧪", color: "#10b981" },
  { id: "Biology", name: "Biology", icon: "🧬", color: "#f59e0b" },
  { id: "French", name: "French", icon: "🇫🇷", color: "#ec4899" },
  { id: "English", name: "English", icon: "📚", color: "#6366f1" },
  { id: "Arabic", name: "Arabic", icon: "🌙", color: "#14b8a6" },
  { id: "Geology", name: "Geology", icon: "🌍", color: "#84cc16" },
  { id: "Philosophy", name: "Philosophy", icon: "🤔", color: "#f97316" },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch dashboard stats
  const { data: stats, isLoading: _statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await adminAPI.getDashboardStats();
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch categories
  const { data: categoriesData, refetch: refetchCategories, isLoading: _categoriesLoading } = useQuery({
    queryKey: ["admin-categories", selectedSubject],
    queryFn: async () => {
      const res = await adminAPI.getCategories(selectedSubject);
      return res.data;
    },
    enabled: !!selectedSubject,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch questions
  const { data: questionsData, refetch: refetchQuestions, isLoading: _questionsLoading } = useQuery({
    queryKey: ["admin-questions", selectedSubject, selectedCategory],
    queryFn: async () => {
      const params = { limit: 100 };
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedCategory) params.category = selectedCategory;
      const res = await adminAPI.getQuestions(params);
      return res.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });

  const categories = categoriesData?.categories || [];
  const questions = questionsData?.questions || [];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-box">
            <LayoutDashboard size={20} />
          </div>
          <span>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-label">Dashboard</span>
            <button 
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveSection('overview')}
            >
              <BarChart3 size={18} />
              <span>Overview</span>
            </button>
          </div>

          <div className="nav-section">
            <span className="nav-label">Content</span>
            <button 
              className={`nav-item ${activeSection === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveSection('categories')}
            >
              <FolderOpen size={18} />
              <span>Categories</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveSection('questions')}
            >
              <BookOpen size={18} />
              <span>Questions</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'test-builder' ? 'active' : ''}`}
              onClick={() => setActiveSection('test-builder')}
            >
              <ListPlus size={18} />
              <span>Test Builder</span>
              <span className="nav-badge">New</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'quizzes' ? 'active' : ''}`}
              onClick={() => setActiveSection('quizzes')}
            >
              <FileText size={18} />
              <span>Quizzes</span>
            </button>
          </div>
        </nav>

        {/* Subject Selector */}
        <div className="subject-selector">
          <h4>Select Subject</h4>
          <div className="subject-list">
            {SUBJECTS.map(subject => (
              <button
                key={subject.id}
                className={`subject-btn ${selectedSubject === subject.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSubject(subject.id);
                  setSelectedCategory(null);
                }}
                style={{ '--subject-color': subject.color }}
              >
                <span className="subject-icon">{subject.icon}</span>
                <span className="subject-name">{subject.name}</span>
                {selectedSubject === subject.id && <Check size={14} className="subject-check" />}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats in Sidebar */}
        <div className="sidebar-stats">
          <div className="stat-box">
            <BookOpen size={16} />
            <div>
              <span className="stat-value">{stats?.stats?.total_questions || 0}</span>
              <span className="stat-label">Questions</span>
            </div>
          </div>
          <div className="stat-box">
            <Eye size={16} />
            <div>
              <span className="stat-value">{stats?.stats?.published_questions || 0}</span>
              <span className="stat-label">Published</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {activeSection === 'overview' && (
          <OverviewPanel stats={stats} />
        )}
        {activeSection === 'categories' && (
          <CategoryManager 
            subject={selectedSubject}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            refetch={refetchCategories}
          />
        )}
        {activeSection === 'questions' && (
          <QuestionManager
            subject={selectedSubject}
            category={selectedCategory}
            categories={categories}
            questions={questions}
            refetch={refetchQuestions}
          />
        )}
        {activeSection === 'test-builder' && (
          <TestBuilder
            subject={selectedSubject}
            categories={categories}
            refetch={refetchQuestions}
          />
        )}
        {activeSection === 'quizzes' && (
          <QuizManager
            subject={selectedSubject}
            categories={categories}
          />
        )}
      </main>

      <style>{styles}</style>
    </div>
  );
}

// Overview Panel with Charts
function OverviewPanel({ stats }) {
  const statCards = [
    { label: "Total Questions", value: stats?.stats?.total_questions || 0, icon: BookOpen, color: "#3b82f6", change: "+12%" },
    { label: "Published", value: stats?.stats?.published_questions || 0, icon: Eye, color: "#10b981", change: "+8%" },
    { label: "Total Quizzes", value: stats?.stats?.total_quizzes || 0, icon: FileText, color: "#8b5cf6", change: "+5%" },
    { label: "Total Users", value: stats?.stats?.total_users || 0, icon: Users, color: "#f59e0b", change: "+23%" },
  ];

  // Mock data for charts
  const subjectStats = SUBJECTS.map(s => ({
    ...s,
    questions: Math.floor(Math.random() * 200 + 50),
    quizzes: Math.floor(Math.random() * 20 + 5)
  }));

  const activityData = [
    { day: "Mon", value: 45 },
    { day: "Tue", value: 62 },
    { day: "Wed", value: 38 },
    { day: "Thu", value: 85 },
    { day: "Fri", value: 73 },
    { day: "Sat", value: 52 },
    { day: "Sun", value: 31 },
  ];

  const maxActivity = Math.max(...activityData.map(d => d.value));

  return (
    <div className="overview-panel">
      <div className="panel-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your content.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {statCards.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ '--card-color': stat.color }}>
            <div className="stat-card-icon">
              <stat.icon size={22} />
            </div>
            <div className="stat-card-content">
              <span className="stat-card-value">{stat.value.toLocaleString()}</span>
              <span className="stat-card-label">{stat.label}</span>
            </div>
            <div className="stat-card-change positive">
              <TrendingUp size={14} />
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Activity Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Weekly Activity</h3>
            <span className="chart-subtitle">Questions answered by users</span>
          </div>
          <div className="bar-chart">
            {activityData.map((d, idx) => (
              <div key={idx} className="bar-item">
                <div 
                  className="bar" 
                  style={{ height: `${(d.value / maxActivity) * 100}%` }}
                >
                  <span className="bar-value">{d.value}</span>
                </div>
                <span className="bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Questions by Subject</h3>
            <span className="chart-subtitle">Distribution across subjects</span>
          </div>
          <div className="subject-bars">
            {subjectStats.slice(0, 6).map((s, idx) => (
              <div key={idx} className="subject-bar-row">
                <div className="subject-bar-info">
                  <span className="subject-bar-icon">{s.icon}</span>
                  <span className="subject-bar-name">{s.name}</span>
                </div>
                <div className="subject-bar-track">
                  <div 
                    className="subject-bar-fill" 
                    style={{ 
                      width: `${(s.questions / 250) * 100}%`,
                      background: s.color 
                    }}
                  />
                </div>
                <span className="subject-bar-value">{s.questions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="recent-section">
        <div className="section-header">
          <h3>Quick Actions</h3>
        </div>
        <div className="quick-actions">
          <button className="quick-action-btn">
            <Plus size={20} />
            <span>Add Question</span>
          </button>
          <button className="quick-action-btn">
            <ListPlus size={20} />
            <span>Create Test</span>
          </button>
          <button className="quick-action-btn">
            <Upload size={20} />
            <span>Import CSV</span>
          </button>
          <button className="quick-action-btn">
            <FolderOpen size={20} />
            <span>New Category</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Category Manager Component
function CategoryManager({ subject, categories, selectedCategory, setSelectedCategory, refetch }) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      setIsCreating(false);
      setFormData({ name: '', description: '' });
      refetch();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      refetch();
    }
  });

  const handleCreate = () => {
    if (!formData.name.trim() || !subject) return;
    createMutation.mutate({ ...formData, subject });
  };

  if (!subject) {
    return (
      <div className="empty-state">
        <FolderOpen size={48} />
        <h3>Select a Subject</h3>
        <p>Choose a subject from the sidebar to manage its categories</p>
      </div>
    );
  }

  return (
    <div className="manager-panel">
      <div className="panel-header">
        <div>
          <h2>Categories for {subject}</h2>
          <p>Organize questions into folders</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} />
          New Category
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="create-form">
          <input
            type="text"
            placeholder="Category name (e.g., Past Exams, URT Exams)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="form-actions">
            <button className="btn-primary" onClick={handleCreate} disabled={createMutation.isPending}>
              <Check size={16} /> Create
            </button>
            <button className="btn-secondary" onClick={() => setIsCreating(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="categories-grid">
        {categories.length === 0 ? (
          <div className="empty-message">
            <p>No categories yet. Create your first category above.</p>
          </div>
        ) : (
          categories.map(cat => (
            <div 
              key={cat._id} 
              className={`category-card ${selectedCategory === cat._id ? 'selected' : ''}`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              <div className="category-header">
                <FolderOpen size={24} style={{ color: cat.color }} />
                <div className="category-info">
                  <h4>{cat.name}</h4>
                  <span>{cat.questionCount || 0} questions • {cat.quizCount || 0} quizzes</span>
                </div>
                <div className="category-actions">
                  <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(cat._id); }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {cat.description && <p className="category-desc">{cat.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Question Manager Component
function QuestionManager({ subject, category, categories, questions, refetch }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    question_text: '',
    choices: [
      { id: 'A', text: '', is_correct: true },
      { id: 'B', text: '', is_correct: false },
      { id: 'C', text: '', is_correct: false },
      { id: 'D', text: '', is_correct: false },
    ],
    difficulty: 'medium',
    source: '',
    explanation: '',
    tags: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-questions']);
      setIsCreating(false);
      resetForm();
      refetch();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-questions']);
      setEditingQuestion(null);
      refetch();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-questions']);
      refetch();
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      question_text: '',
      choices: [
        { id: 'A', text: '', is_correct: true },
        { id: 'B', text: '', is_correct: false },
        { id: 'C', text: '', is_correct: false },
        { id: 'D', text: '', is_correct: false },
      ],
      difficulty: 'medium',
      source: '',
      explanation: '',
      tags: []
    });
  };

  const handleCreate = () => {
    if (!formData.question_text.trim() || !subject) return;
    createMutation.mutate({ 
      ...formData, 
      subject,
      category: category || undefined,
      title: formData.title || formData.question_text.substring(0, 50)
    });
  };

  const handleChoiceChange = (index, field, value) => {
    const newChoices = [...formData.choices];
    if (field === 'is_correct') {
      newChoices.forEach((c, i) => c.is_correct = i === index);
    } else {
      newChoices[index][field] = value;
    }
    setFormData({ ...formData, choices: newChoices });
  };

  const filteredQuestions = questions.filter(q => 
    !searchQuery || 
    q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!subject) {
    return (
      <div className="empty-state">
        <BookOpen size={48} />
        <h3>Select a Subject</h3>
        <p>Choose a subject from the sidebar to manage questions</p>
      </div>
    );
  }

  return (
    <div className="manager-panel">
      <div className="panel-header">
        <div>
          <h2>Questions {category ? `in ${categories.find(c => c._id === category)?.name}` : `for ${subject}`}</h2>
          <p>{filteredQuestions.length} questions</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} />
          Add Question
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingQuestion) && (
        <div className="question-form">
          <h3>{isCreating ? 'New Question' : 'Edit Question'}</h3>
          
          <div className="form-group">
            <label>Question Title (short)</label>
            <input
              type="text"
              placeholder="e.g., Quadratic Formula"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Question Text (supports LaTeX with $...$ )</label>
            <textarea
              placeholder="Enter the question... Use $...$ for math"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Answer Choices</label>
            <div className="choices-list">
              {formData.choices.map((choice, idx) => (
                <div key={choice.id} className="choice-row">
                  <span className="choice-letter">{choice.id}</span>
                  <input
                    type="text"
                    placeholder={`Option ${choice.id}`}
                    value={choice.text}
                    onChange={(e) => handleChoiceChange(idx, 'text', e.target.value)}
                  />
                  <button
                    type="button"
                    className={`correct-btn ${choice.is_correct ? 'active' : ''}`}
                    onClick={() => handleChoiceChange(idx, 'is_correct', true)}
                    title="Mark as correct"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Source</label>
              <input
                type="text"
                placeholder="e.g., URT 2024, Past Exam"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Explanation (shown after answering)</label>
            <textarea
              placeholder="Explain the solution..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button 
              className="btn-primary" 
              onClick={isCreating ? handleCreate : () => updateMutation.mutate({ id: editingQuestion._id, data: formData })}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Save size={16} /> {isCreating ? 'Create Question' : 'Save Changes'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => { setIsCreating(false); setEditingQuestion(null); resetForm(); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="questions-list">
        {filteredQuestions.length === 0 ? (
          <div className="empty-message">
            <p>No questions found. Add your first question above.</p>
          </div>
        ) : (
          filteredQuestions.map(q => (
            <div key={q._id} className="question-card">
              <div className="question-content">
                <h4>{q.title || 'Untitled'}</h4>
                <p className="question-text">{q.question_text?.substring(0, 150)}...</p>
                <div className="question-meta">
                  <span className={`difficulty ${q.difficulty}`}>{q.difficulty}</span>
                  <span className="source">{q.source}</span>
                  {q.published ? (
                    <span className="status published"><Eye size={12} /> Published</span>
                  ) : (
                    <span className="status draft"><EyeOff size={12} /> Draft</span>
                  )}
                </div>
              </div>
              <div className="question-actions">
                <button onClick={() => { setEditingQuestion(q); setFormData(q); }}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteMutation.mutate(q._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Quiz Manager Component
function QuizManager({ subject, category }) {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: quizzesData, refetch } = useQuery({
    queryKey: ['admin-quizzes', subject],
    queryFn: async () => {
      const params = {};
      if (subject) params.subject = subject;
      const res = await adminAPI.getQuizzes(params);
      return res.data;
    }
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_time: 30,
    rules: { count: 10, difficulty: 'mixed', randomize: true }
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-quizzes']);
      setIsCreating(false);
      refetch();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-quizzes']);
      refetch();
    }
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }) => adminAPI.publishQuiz(id, published),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-quizzes']);
      refetch();
    }
  });

  const handleCreate = () => {
    if (!formData.title.trim() || !subject) return;
    createMutation.mutate({ 
      ...formData, 
      subject,
      category: category || undefined
    });
  };

  const quizzes = quizzesData?.quizzes || [];

  if (!subject) {
    return (
      <div className="empty-state">
        <FileText size={48} />
        <h3>Select a Subject</h3>
        <p>Choose a subject from the sidebar to manage quizzes</p>
      </div>
    );
  }

  return (
    <div className="manager-panel">
      <div className="panel-header">
        <div>
          <h2>Quizzes for {subject}</h2>
          <p>{quizzes.length} quizzes</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} />
          New Quiz
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="question-form">
          <h3>Create New Quiz</h3>
          
          <div className="form-group">
            <label>Quiz Title</label>
            <input
              type="text"
              placeholder="e.g., URT Practice Test 1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe this quiz..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Time Limit (minutes)</label>
              <input
                type="number"
                value={formData.total_time}
                onChange={(e) => setFormData({ ...formData, total_time: parseInt(e.target.value) })}
                min={5}
                max={180}
              />
            </div>
            <div className="form-group">
              <label>Number of Questions</label>
              <input
                type="number"
                value={formData.rules.count}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  rules: { ...formData.rules, count: parseInt(e.target.value) }
                })}
                min={5}
                max={100}
              />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={formData.rules.difficulty}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  rules: { ...formData.rules, difficulty: e.target.value }
                })}
              >
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={handleCreate} disabled={createMutation.isPending}>
              <Save size={16} /> Create Quiz
            </button>
            <button className="btn-secondary" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="quizzes-list">
        {quizzes.length === 0 ? (
          <div className="empty-message">
            <p>No quizzes yet. Create your first quiz above.</p>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-content">
                <h4>{quiz.title}</h4>
                <p>{quiz.description}</p>
                <div className="quiz-meta">
                  <span>{quiz.questions?.length || quiz.rules?.count || 0} questions</span>
                  <span>{quiz.total_time} min</span>
                  <span>{quiz.attempts || 0} attempts</span>
                </div>
              </div>
              <div className="quiz-actions">
                <button
                  className={`publish-btn ${quiz.published ? 'published' : ''}`}
                  onClick={() => publishMutation.mutate({ id: quiz._id, published: !quiz.published })}
                >
                  {quiz.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  {quiz.published ? 'Published' : 'Draft'}
                </button>
                <button onClick={() => deleteMutation.mutate(quiz._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// TEST BUILDER - Create entire tests with multiple questions at once
function TestBuilder({ subject, categories, refetch }) {
  const [step, setStep] = useState(1); // 1: Setup, 2: Questions, 3: Review
  const [testInfo, setTestInfo] = useState({
    title: '',
    description: '',
    category: '',
    source: '',
    difficulty: 'medium',
    total_time: 30
  });
  const [questions, setQuestions] = useState([createEmptyQuestion()]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const queryClient = useQueryClient();

  function createEmptyQuestion() {
    return {
      question_text: '',
      choices: [
        { id: 'A', text: '', is_correct: true },
        { id: 'B', text: '', is_correct: false },
        { id: 'C', text: '', is_correct: false },
        { id: 'D', text: '', is_correct: false },
      ],
      explanation: ''
    };
  }

  const handleQuestionChange = (field, value) => {
    const updated = [...questions];
    updated[currentQ][field] = value;
    setQuestions(updated);
  };

  const handleChoiceChange = (choiceIdx, field, value) => {
    const updated = [...questions];
    if (field === 'is_correct') {
      updated[currentQ].choices.forEach((c, i) => c.is_correct = i === choiceIdx);
    } else {
      updated[currentQ].choices[choiceIdx][field] = value;
    }
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
    setCurrentQ(questions.length);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (currentQ >= updated.length) setCurrentQ(updated.length - 1);
  };

  const duplicateQuestion = (idx) => {
    const copy = JSON.parse(JSON.stringify(questions[idx]));
    copy.question_text = copy.question_text + ' (copy)';
    setQuestions([...questions, copy]);
    setCurrentQ(questions.length);
  };

  const handleSubmit = async () => {
    if (!subject || !testInfo.title.trim()) return;
    
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Create all questions
      const createdQuestions = [];
      for (const q of questions) {
        if (!q.question_text.trim()) continue;
        
        const questionData = {
          title: testInfo.title,
          question_text: q.question_text,
          choices: q.choices,
          explanation: q.explanation,
          subject,
          category: testInfo.category || undefined,
          source: testInfo.source,
          difficulty: testInfo.difficulty,
          published: true
        };

        const res = await adminAPI.createQuestion(questionData);
        if (res.data?.question) {
          createdQuestions.push(res.data.question._id);
        }
      }

      // Create the quiz/test
      if (createdQuestions.length > 0) {
        await adminAPI.createQuiz({
          title: testInfo.title,
          description: testInfo.description,
          subject,
          category: testInfo.category || undefined,
          questions: createdQuestions,
          total_time: testInfo.total_time,
          published: true,
          rules: {
            count: createdQuestions.length,
            difficulty: testInfo.difficulty,
            randomize: false
          }
        });
      }

      setSubmitResult({ success: true, count: createdQuestions.length });
      queryClient.invalidateQueries(['admin-questions']);
      queryClient.invalidateQueries(['admin-quizzes']);
      refetch?.();

    } catch (error) {
      console.error('Error creating test:', error);
      setSubmitResult({ success: false, error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBuilder = () => {
    setStep(1);
    setTestInfo({ title: '', description: '', category: '', source: '', difficulty: 'medium', total_time: 30 });
    setQuestions([createEmptyQuestion()]);
    setCurrentQ(0);
    setSubmitResult(null);
  };

  const currentQuestion = questions[currentQ];
  const validQuestions = questions.filter(q => q.question_text.trim()).length;
  const subjectInfo = SUBJECTS.find(s => s.id === subject);

  if (!subject) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Layers size={48} />
        </div>
        <h3>Select a Subject First</h3>
        <p>Choose a subject from the sidebar to start building a test</p>
      </div>
    );
  }

  // Success Screen
  if (submitResult?.success) {
    return (
      <div className="builder-success">
        <div className="success-content">
          <div className="success-icon">
            <CheckCircle2 size={64} />
          </div>
          <h2>Test Created Successfully! 🎉</h2>
          <p>Created {submitResult.count} questions and 1 quiz for {subject}</p>
          <div className="success-actions">
            <button className="btn-primary" onClick={resetBuilder}>
              <Plus size={18} /> Create Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="header-title">
          <span className="header-icon" style={{ background: subjectInfo?.color + '20', color: subjectInfo?.color }}>
            <Layers size={22} />
          </span>
          <div>
            <h2>Test Builder</h2>
            <p>Create a complete test with multiple questions at once</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="builder-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">Setup</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Questions</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">Review</span>
          </div>
        </div>
      </div>

      {/* Step 1: Test Setup */}
      {step === 1 && (
        <div className="builder-step-content">
          <div className="form-card large">
            <div className="form-card-header">
              <Target size={20} />
              <h3>Test Information</h3>
            </div>

            <div className="form-group">
              <label>Test Title *</label>
              <input
                type="text"
                placeholder="e.g., URT Mathematics 2024, Physics Final Exam"
                value={testInfo.title}
                onChange={(e) => setTestInfo({ ...testInfo, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe what this test covers..."
                value={testInfo.description}
                onChange={(e) => setTestInfo({ ...testInfo, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={testInfo.category}
                  onChange={(e) => setTestInfo({ ...testInfo, category: e.target.value })}
                >
                  <option value="">No Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Source</label>
                <input
                  type="text"
                  placeholder="e.g., URT 2024"
                  value={testInfo.source}
                  onChange={(e) => setTestInfo({ ...testInfo, source: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Time Limit (min)</label>
                <input
                  type="number"
                  value={testInfo.total_time}
                  onChange={(e) => setTestInfo({ ...testInfo, total_time: parseInt(e.target.value) || 30 })}
                  min={5}
                  max={180}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Default Difficulty</label>
              <div className="difficulty-select">
                {['easy', 'medium', 'hard'].map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`difficulty-btn ${testInfo.difficulty === d ? 'active' : ''} ${d}`}
                    onClick={() => setTestInfo({ ...testInfo, difficulty: d })}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="btn-primary" 
                onClick={() => setStep(2)}
                disabled={!testInfo.title.trim()}
              >
                Continue to Questions <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <div className="builder-questions">
          {/* Question Navigator */}
          <div className="question-navigator">
            <div className="nav-header">
              <h4>Questions</h4>
              <button className="btn-sm" onClick={addQuestion}>
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="question-nav-list">
              {questions.map((q, idx) => (
                <div 
                  key={idx}
                  className={`question-nav-item ${idx === currentQ ? 'active' : ''} ${q.question_text.trim() ? 'filled' : ''}`}
                  onClick={() => setCurrentQ(idx)}
                >
                  <span className="q-num">{idx + 1}</span>
                  <span className="q-preview">
                    {q.question_text.trim() ? q.question_text.substring(0, 30) + '...' : 'Empty question'}
                  </span>
                  {q.question_text.trim() && <Check size={12} className="q-check" />}
                </div>
              ))}
            </div>
            <div className="nav-footer">
              <span>{validQuestions} of {questions.length} filled</span>
            </div>
          </div>

          {/* Question Editor */}
          <div className="question-editor">
            <div className="editor-header">
              <h3>Question {currentQ + 1}</h3>
              <div className="editor-actions">
                <button className="btn-sm" onClick={() => duplicateQuestion(currentQ)}>
                  <Copy size={14} /> Duplicate
                </button>
                {questions.length > 1 && (
                  <button className="btn-sm danger" onClick={() => removeQuestion(currentQ)}>
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Question Text <span className="label-hint">Use $...$ for LaTeX math</span></label>
              <textarea
                placeholder="Enter the question..."
                value={currentQuestion.question_text}
                onChange={(e) => handleQuestionChange('question_text', e.target.value)}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Answer Choices (click ✓ to mark correct)</label>
              <div className="choices-list">
                {currentQuestion.choices.map((choice, idx) => (
                  <div key={choice.id} className={`choice-row ${choice.is_correct ? 'correct' : ''}`}>
                    <span className="choice-letter">{choice.id}</span>
                    <input
                      type="text"
                      placeholder={`Option ${choice.id}`}
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(idx, 'text', e.target.value)}
                    />
                    <button
                      type="button"
                      className={`correct-btn ${choice.is_correct ? 'active' : ''}`}
                      onClick={() => handleChoiceChange(idx, 'is_correct', true)}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Explanation (optional)</label>
              <textarea
                placeholder="Explain the solution..."
                value={currentQuestion.explanation}
                onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                rows={2}
              />
            </div>

            {/* Quick Navigation */}
            <div className="editor-nav">
              <button 
                className="btn-secondary" 
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
              >
                ← Previous
              </button>
              {currentQ < questions.length - 1 ? (
                <button 
                  className="btn-primary" 
                  onClick={() => setCurrentQ(currentQ + 1)}
                >
                  Next Question →
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={addQuestion}
                >
                  <Plus size={16} /> Add Question
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step Navigation */}
      {step === 2 && (
        <div className="step-actions-bar">
          <button className="btn-secondary" onClick={() => setStep(1)}>
            ← Back to Setup
          </button>
          <button 
            className="btn-primary" 
            onClick={() => setStep(3)}
            disabled={validQuestions === 0}
          >
            Review & Create ({validQuestions} questions) →
          </button>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="builder-review">
          <div className="review-card">
            <div className="review-header">
              <div className="review-icon">
                <FileText size={28} />
              </div>
              <div>
                <h3>{testInfo.title}</h3>
                <p>{testInfo.description || 'No description'}</p>
              </div>
            </div>

            <div className="review-stats">
              <div className="review-stat">
                <span className="stat-num">{validQuestions}</span>
                <span className="stat-text">Questions</span>
              </div>
              <div className="review-stat">
                <span className="stat-num">{testInfo.total_time}</span>
                <span className="stat-text">Minutes</span>
              </div>
              <div className="review-stat">
                <span className="stat-num">{testInfo.difficulty}</span>
                <span className="stat-text">Difficulty</span>
              </div>
            </div>

            <div className="review-details">
              <div className="detail-row">
                <span>Subject:</span>
                <strong>{subjectInfo?.icon} {subject}</strong>
              </div>
              <div className="detail-row">
                <span>Category:</span>
                <strong>{categories.find(c => c._id === testInfo.category)?.name || 'None'}</strong>
              </div>
              <div className="detail-row">
                <span>Source:</span>
                <strong>{testInfo.source || 'Not specified'}</strong>
              </div>
            </div>

            <div className="review-questions-preview">
              <h4>Questions Preview</h4>
              {questions.filter(q => q.question_text.trim()).map((q, idx) => (
                <div key={idx} className="preview-item">
                  <span className="preview-num">{idx + 1}</span>
                  <span className="preview-text">{q.question_text.substring(0, 80)}...</span>
                </div>
              ))}
            </div>

            {submitResult?.error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {submitResult.error}
              </div>
            )}

            <div className="review-actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                ← Back to Edit
              </button>
              <button 
                className="btn-primary large" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Creating...</>
                ) : (
                  <><CheckCircle2 size={18} /> Create Test ({validQuestions} questions)</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = `
  .admin-dashboard {
    display: flex;
    min-height: 100vh;
    background: var(--bg-primary);
  }

  /* ===== SIDEBAR ===== */
  .admin-sidebar {
    width: 280px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
    font-weight: 700;
    font-size: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .logo-box {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .sidebar-nav {
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-section { margin-bottom: 16px; }

  .nav-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
    padding: 8px 12px 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }

  .nav-item:hover { background: var(--bg-tertiary); color: var(--text-primary); }
  .nav-item.active { 
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .nav-badge {
    margin-left: auto;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    background: #10b981;
    color: white;
  }

  .subject-selector {
    padding: 16px;
    border-top: 1px solid var(--border-color);
    flex: 1;
    overflow-y: auto;
  }

  .subject-selector h4 {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
    margin-bottom: 12px;
  }

  .subject-list { display: flex; flex-direction: column; gap: 4px; }

  .subject-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s;
  }

  .subject-btn:hover { 
    background: var(--bg-tertiary);
    border-color: var(--border-color);
  }
  
  .subject-btn.active { 
    background: var(--subject-color)15;
    border-color: var(--subject-color);
    color: var(--text-primary); 
    font-weight: 500; 
  }

  .subject-icon { font-size: 1.1rem; }
  .subject-name { flex: 1; }
  .subject-check { color: var(--subject-color); }

  .sidebar-stats {
    padding: 16px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 12px;
  }

  .stat-box {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: var(--bg-tertiary);
    border-radius: 10px;
  }

  .stat-box svg { color: var(--text-tertiary); }
  .stat-box > div { display: flex; flex-direction: column; }
  .stat-box .stat-value { font-size: 1.1rem; font-weight: 700; line-height: 1.2; }
  .stat-box .stat-label { font-size: 0.7rem; color: var(--text-tertiary); }

  /* ===== MAIN CONTENT ===== */
  .admin-main { flex: 1; padding: 32px; overflow-y: auto; background: var(--bg-primary); }

  /* ===== OVERVIEW PANEL ===== */
  .overview-panel { max-width: 1200px; }

  .panel-header { margin-bottom: 28px; }
  .panel-header h1 { margin: 0 0 4px; font-size: 1.75rem; font-weight: 700; }
  .panel-header p { margin: 0; color: var(--text-tertiary); }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    transition: all 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  }

  .stat-card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--card-color)15;
    color: var(--card-color);
  }

  .stat-card-content { flex: 1; display: flex; flex-direction: column; }
  .stat-card-value { font-size: 1.75rem; font-weight: 700; line-height: 1.2; }
  .stat-card-label { font-size: 0.85rem; color: var(--text-tertiary); }

  .stat-card-change {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .stat-card-change.positive { background: #dcfce7; color: #16a34a; }

  .charts-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 28px;
  }

  .chart-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
  }

  .chart-header { margin-bottom: 20px; }
  .chart-header h3 { margin: 0 0 4px; font-size: 1.1rem; }
  .chart-subtitle { font-size: 0.85rem; color: var(--text-tertiary); }

  .bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    height: 180px;
  }

  .bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    height: 100%;
  }

  .bar {
    width: 100%;
    background: linear-gradient(180deg, #6366f1, #818cf8);
    border-radius: 6px 6px 0 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
    min-height: 20px;
    transition: all 0.3s;
  }

  .bar:hover { opacity: 0.8; }
  .bar-value { font-size: 0.75rem; font-weight: 600; color: white; }
  .bar-label { font-size: 0.75rem; color: var(--text-tertiary); }

  .subject-bars { display: flex; flex-direction: column; gap: 14px; }

  .subject-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .subject-bar-info {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 120px;
  }

  .subject-bar-icon { font-size: 1rem; }
  .subject-bar-name { font-size: 0.85rem; color: var(--text-secondary); }

  .subject-bar-track {
    flex: 1;
    height: 10px;
    background: var(--bg-tertiary);
    border-radius: 5px;
    overflow: hidden;
  }

  .subject-bar-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.5s ease;
  }

  .subject-bar-value {
    font-size: 0.85rem;
    font-weight: 600;
    width: 40px;
    text-align: right;
  }

  .recent-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
  }

  .section-header { margin-bottom: 16px; }
  .section-header h3 { margin: 0; font-size: 1.1rem; }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .quick-action-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    transition: all 0.15s;
  }

  .quick-action-btn:hover {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.05);
  }

  /* ===== MANAGER PANELS ===== */
  .manager-panel { max-width: 1000px; }

  .header-title {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .header-title h2 { margin: 0 0 2px; font-size: 1.5rem; }
  .header-title p { margin: 0; font-size: 0.9rem; color: var(--text-tertiary); }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 20px;
  }

  .panel-header h2 { margin: 0 0 4px; }
  .panel-header p { margin: 0; color: var(--text-tertiary); font-size: 0.9rem; }

  /* ===== EMPTY STATES ===== */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60vh;
    text-align: center;
    color: var(--text-tertiary);
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    background: var(--bg-secondary);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .empty-state h3 { margin: 0 0 8px; color: var(--text-secondary); font-size: 1.25rem; }
  .empty-state p { margin: 0; font-size: 0.95rem; }

  .empty-message {
    grid-column: 1 / -1;
    padding: 48px;
    text-align: center;
    background: var(--bg-secondary);
    border: 2px dashed var(--border-color);
    border-radius: 16px;
    color: var(--text-tertiary);
  }

  /* ===== BUTTONS ===== */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-primary:hover { 
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }
  
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-primary.large { padding: 14px 28px; font-size: 1rem; }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-secondary:hover { border-color: #6366f1; color: #6366f1; }
  .btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-sm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    color: var(--text-primary);
    transition: all 0.15s;
  }

  .btn-sm:hover { border-color: #6366f1; }
  .btn-sm.danger:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

  /* ===== FORM STYLES ===== */
  .create-form, .question-form {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 24px;
  }

  .form-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .form-card.large { padding: 28px; }

  .form-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .form-card-header svg { color: #6366f1; }
  .form-card-header h3 { margin: 0; font-size: 1.1rem; }

  .question-form h3 { margin: 0 0 24px; font-size: 1.1rem; }

  .form-group { margin-bottom: 18px; }

  .form-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .label-hint {
    font-weight: 400;
    color: var(--text-tertiary);
    font-size: 0.8rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: all 0.15s;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .form-actions { 
    display: flex; 
    gap: 12px; 
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }

  .create-form input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--bg-primary);
    margin-bottom: 12px;
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  /* ===== CHOICE INPUTS ===== */
  .choices-list { display: flex; flex-direction: column; gap: 12px; }

  .choice-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    transition: all 0.15s;
  }

  .choice-row.correct {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
  }

  .choice-letter {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.8rem;
    color: var(--text-tertiary);
  }

  .choice-row.correct .choice-letter {
    background: #10b981;
    color: white;
  }

  .choice-row input { flex: 1; margin: 0; border: none; background: transparent; padding: 0; }
  .choice-row input:focus { outline: none; box-shadow: none; }

  .correct-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    color: var(--text-tertiary);
    transition: all 0.15s;
  }

  .correct-btn:hover { border-color: #10b981; color: #10b981; }
  .correct-btn.active { background: #10b981; border-color: #10b981; color: white; }

  .difficulty-select { display: flex; gap: 10px; }

  .difficulty-btn {
    flex: 1;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    background: var(--bg-primary);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s;
    color: var(--text-secondary);
  }

  .difficulty-btn:hover { border-color: var(--text-tertiary); }
  .difficulty-btn.active.easy { background: #dcfce7; border-color: #10b981; color: #16a34a; }
  .difficulty-btn.active.medium { background: #fef3c7; border-color: #f59e0b; color: #d97706; }
  .difficulty-btn.active.hard { background: #fee2e2; border-color: #ef4444; color: #dc2626; }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .search-bar input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    color: var(--text-primary);
  }

  .search-bar input:focus { outline: none; }

  /* ===== CATEGORIES GRID ===== */
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .category-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-card:hover { 
    border-color: #6366f1;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.06);
  }
  
  .category-card.selected { 
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .category-header { display: flex; align-items: center; gap: 12px; }
  .category-info { flex: 1; }
  .category-info h4 { margin: 0 0 4px; font-size: 1rem; }
  .category-info span { font-size: 0.8rem; color: var(--text-tertiary); }

  .category-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
  .category-card:hover .category-actions { opacity: 1; }

  .category-actions button {
    padding: 8px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: 6px;
  }

  .category-actions button:hover { background: var(--bg-tertiary); color: var(--text-primary); }

  .category-desc { margin: 12px 0 0; font-size: 0.85rem; color: var(--text-secondary); }

  /* ===== QUESTIONS LIST ===== */
  .questions-list { display: flex; flex-direction: column; gap: 12px; }

  .question-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 18px 22px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.15s;
  }

  .question-card:hover { border-color: var(--text-tertiary); }

  .question-content { flex: 1; }
  .question-content h4 { margin: 0 0 6px; font-size: 0.95rem; }
  .question-text { margin: 0 0 10px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }

  .question-meta { display: flex; gap: 10px; flex-wrap: wrap; }

  .question-meta span {
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 6px;
    background: var(--bg-tertiary);
    font-weight: 500;
  }

  .difficulty.easy { background: #dcfce7; color: #16a34a; }
  .difficulty.medium { background: #fef3c7; color: #d97706; }
  .difficulty.hard { background: #fee2e2; color: #dc2626; }

  .status { display: flex; align-items: center; gap: 4px; }
  .status.published { background: #dbeafe; color: #2563eb; }
  .status.draft { background: var(--bg-tertiary); color: var(--text-tertiary); }

  .question-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
  .question-card:hover .question-actions { opacity: 1; }

  .question-actions button {
    padding: 8px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    cursor: pointer;
    border-radius: 8px;
  }

  .question-actions button:hover { background: var(--bg-tertiary); color: var(--text-primary); }

  /* ===== QUIZZES LIST ===== */
  .quizzes-list { display: flex; flex-direction: column; gap: 12px; }

  .quiz-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 22px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    transition: all 0.2s;
  }

  .quiz-card:hover { border-color: var(--text-tertiary); }

  .quiz-content { flex: 1; }
  .quiz-content h4 { margin: 0 0 6px; }
  .quiz-content p { margin: 0 0 10px; font-size: 0.9rem; color: var(--text-secondary); }
  .quiz-meta { display: flex; gap: 16px; font-size: 0.8rem; color: var(--text-tertiary); }

  .quiz-actions { display: flex; gap: 8px; }

  .publish-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s;
  }

  .publish-btn.published { background: #dbeafe; border-color: #93c5fd; color: #2563eb; }

  /* ===== TEST BUILDER ===== */
  .test-builder { max-width: 1100px; }

  .builder-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    gap: 24px;
    flex-wrap: wrap;
  }

  .builder-steps {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-tertiary);
  }

  .step.active { color: var(--text-primary); }
  .step.completed { color: #10b981; }

  .step-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 600;
    background: var(--bg-tertiary);
  }

  .step.active .step-num { background: #6366f1; color: white; }
  .step.completed .step-num { background: #10b981; color: white; }

  .step-label { font-size: 0.9rem; font-weight: 500; }

  .step-line { width: 40px; height: 2px; background: var(--border-color); }

  .builder-step-content { max-width: 700px; }

  /* Question Builder */
  .builder-questions {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 24px;
  }

  .question-navigator {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 16px;
    height: fit-content;
    position: sticky;
    top: 100px;
  }

  .nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .nav-header h4 { margin: 0; font-size: 0.95rem; }

  .question-nav-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 12px;
  }

  .question-nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .question-nav-item:hover { border-color: var(--text-tertiary); }
  .question-nav-item.active { border-color: #6366f1; background: rgba(99, 102, 241, 0.05); }
  .question-nav-item.filled { border-left: 3px solid #10b981; }

  .q-num {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    background: var(--bg-tertiary);
    border-radius: 4px;
  }

  .q-preview {
    flex: 1;
    font-size: 0.8rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .q-check { color: #10b981; }

  .nav-footer {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    text-align: center;
    padding-top: 12px;
    border-top: 1px solid var(--border-color);
  }

  .question-editor {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 24px;
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .editor-header h3 { margin: 0; font-size: 1.1rem; }
  .editor-actions { display: flex; gap: 8px; }

  .editor-nav {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }

  .step-actions-bar {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    padding: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 14px;
  }

  /* Review Step */
  .builder-review { max-width: 600px; margin: 0 auto; }

  .review-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 28px;
  }

  .review-header {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .review-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .review-header h3 { margin: 0 0 4px; font-size: 1.25rem; }
  .review-header p { margin: 0; color: var(--text-secondary); font-size: 0.9rem; }

  .review-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
  }

  .review-stat {
    flex: 1;
    text-align: center;
    padding: 16px;
    background: var(--bg-primary);
    border-radius: 12px;
  }

  .stat-num { display: block; font-size: 1.5rem; font-weight: 700; color: #6366f1; }
  .stat-text { font-size: 0.8rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }

  .review-details {
    margin-bottom: 24px;
    padding: 16px;
    background: var(--bg-primary);
    border-radius: 10px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color);
  }

  .detail-row:last-child { border-bottom: none; }
  .detail-row span { color: var(--text-tertiary); }

  .review-questions-preview { margin-bottom: 24px; }
  .review-questions-preview h4 { margin: 0 0 12px; font-size: 0.9rem; color: var(--text-secondary); }

  .preview-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--bg-primary);
    border-radius: 8px;
    margin-bottom: 6px;
    font-size: 0.85rem;
  }

  .preview-num {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.75rem;
  }

  .preview-text {
    flex: 1;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.9rem;
  }

  .review-actions {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
  }

  /* Success Screen */
  .builder-success {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }

  .success-content { text-align: center; max-width: 400px; }
  .success-icon { color: #10b981; margin-bottom: 20px; }
  .success-content h2 { margin: 0 0 8px; font-size: 1.75rem; }
  .success-content p { color: var(--text-secondary); margin-bottom: 28px; }
  .success-actions { display: flex; flex-direction: column; gap: 12px; }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 1024px) {
    .charts-row { grid-template-columns: 1fr; }
    .builder-questions { grid-template-columns: 1fr; }
    .question-navigator { position: relative; top: 0; }
  }

  @media (max-width: 768px) {
    .admin-dashboard { flex-direction: column; }
    .admin-sidebar { 
      width: 100%; 
      height: auto; 
      position: relative;
      max-height: 70vh;
    }
    .subject-selector { max-height: 200px; overflow-y: auto; }
    .form-row { grid-template-columns: 1fr; }
    .builder-header { flex-direction: column; }
    .builder-steps { order: 2; }
  }
`;
