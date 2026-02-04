import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronRight, 
  FolderOpen, 
  FileText, 
  Clock, 
  Users, 
  Star,
  Play,
  Shuffle,
  Zap,
  Swords,
  ArrowLeft,
  Search,
  CheckCircle,
  BookOpen,
  Eye
} from "lucide-react";
import api from "../api/axios";

const SUBJECTS = [
  { id: "Math", name: "Mathematics", icon: "📐", color: "#3b82f6" },
  { id: "Physics", name: "Physics", icon: "⚛️", color: "#8b5cf6" },
  { id: "Chemistry", name: "Chemistry", icon: "🧪", color: "#10b981" },
  { id: "Biology", name: "Biology", icon: "🧬", color: "#f59e0b" },
  { id: "French", name: "French", icon: "🇫🇷", color: "#ec4899" },
  { id: "English", name: "English", icon: "🇬🇧", color: "#6366f1" },
  { id: "Arabic", name: "Arabic", icon: "🇸🇦", color: "#14b8a6" },
  { id: "Geology", name: "Geology", icon: "🌍", color: "#84cc16" },
  { id: "Mechanics", name: "Mechanics", icon: "⚙️", color: "#f97316" },
];

export default function BrowsePage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user progress for completion percentages
  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me/stats');
        return res.data.data;
      } catch {
        return null;
      }
    }
  });

  // Fetch categories for selected subject
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["browse-categories", selectedSubject],
    queryFn: async () => {
      const res = await api.get(`/categories/browse?subject=${selectedSubject}`);
      return res.data;
    },
    enabled: !!selectedSubject
  });

  // Fetch quizzes for selected category or subject
  const { data: quizzesData, isLoading: loadingQuizzes } = useQuery({
    queryKey: ["browse-quizzes", selectedSubject, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSubject) params.append("subject", selectedSubject);
      if (selectedCategory) params.append("category", selectedCategory);
      params.append("published", "true");
      const res = await api.get(`/quizzes?${params.toString()}`);
      return res.data;
    },
    enabled: !!selectedSubject
  });

  const categories = categoriesData?.categories || [];
  const quizzes = quizzesData?.quizzes || quizzesData?.data || [];
  const subjectInfo = SUBJECTS.find(s => s.id === selectedSubject);
  const completedQuizIds = userStats?.completedQuizIds || [];
  
  // Check if a quiz is completed
  const isQuizCompleted = (quizId) => {
    return completedQuizIds.includes(quizId?.toString());
  };
  
  // Calculate subject progress
  const getSubjectProgress = (subjectId) => {
    if (!userStats?.subjectProgress) return null;
    const progress = userStats.subjectProgress.find(sp => sp.subject === subjectId);
    if (!progress) return null;
    return {
      quizzesCompleted: progress.quizzes_completed || 0,
      accuracy: progress.average_score || 0,
      questionsCorrect: progress.questions_correct || 0
    };
  };

  // Filter quizzes by search
  const filteredQuizzes = searchQuery 
    ? quizzes.filter(q => 
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quizzes;

  // Navigation handlers
  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    }
  };

  const startQuiz = (quizId) => {
    if (isQuizCompleted(quizId)) {
      navigate(`/quiz/${quizId}/review`);
    } else {
      navigate(`/quiz/${selectedSubject}/${quizId}`);
    }
  };

  const startCustomQuiz = () => {
    const params = new URLSearchParams({
      subject: selectedSubject,
      ...(selectedCategory && { category: selectedCategory }),
    });
    navigate(`/quiz/custom?${params.toString()}`);
  };

  const startRandomQuiz = () => {
    navigate(`/quiz/random?subject=${selectedSubject}&count=10`);
  };

  // Render breadcrumb
  const renderBreadcrumb = () => {
    if (!selectedSubject) return null;

    return (
      <div className="breadcrumb">
        <button onClick={() => { setSelectedSubject(null); setSelectedCategory(null); }}>
          Subjects
        </button>
        <ChevronRight size={16} />
        <button 
          onClick={() => setSelectedCategory(null)}
          className={!selectedCategory ? 'active' : ''}
        >
          {subjectInfo?.name}
        </button>
        {selectedCategory && (
          <>
            <ChevronRight size={16} />
            <span className="active">
              {categories.find(c => c._id === selectedCategory)?.name}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="browse-page">
      {/* Header */}
      <div className="browse-header">
        {selectedSubject && (
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="header-content">
          <h1>
            {!selectedSubject ? "Choose a Subject" : 
             !selectedCategory ? `${subjectInfo?.icon} ${subjectInfo?.name}` :
             categories.find(c => c._id === selectedCategory)?.name}
          </h1>
          <p>
            {!selectedSubject ? "Select a subject to explore quizzes and practice tests" :
             !selectedCategory ? "Choose a category or start practicing" :
             "Select a quiz or create a custom practice session"}
          </p>
        </div>
      </div>

      {renderBreadcrumb()}

      {/* Subject Selection */}
      {!selectedSubject && (
        <div className="subjects-grid">
          {SUBJECTS.map(subject => {
            const progress = getSubjectProgress(subject.id);
            return (
              <div
                key={subject.id}
                className="subject-card"
                onClick={() => setSelectedSubject(subject.id)}
                style={{ '--subject-color': subject.color }}
              >
                <span className="subject-icon">{subject.icon}</span>
                <div className="subject-info">
                  <h3>{subject.name}</h3>
                  {progress && (
                    <div className="subject-progress">
                      <span className="progress-stat">
                        <CheckCircle size={12} /> {progress.quizzesCompleted} quizzes
                      </span>
                      <span className="progress-stat">
                        🎯 {progress.accuracy}% accuracy
                      </span>
                    </div>
                  )}
                </div>
                <ChevronRight className="arrow" size={20} />
              </div>
            );
          })}
        </div>
      )}

      {/* Category Selection */}
      {selectedSubject && !selectedCategory && (
        <>
          {/* Search Box */}
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="quick-btn practice" onClick={startCustomQuiz}>
              <Play size={20} />
              <span>Practice Mode</span>
              <small>Customize your session</small>
            </button>
            <button className="quick-btn random" onClick={startRandomQuiz}>
              <Shuffle size={20} />
              <span>Quick 10</span>
              <small>Random questions</small>
            </button>
            <button className="quick-btn battle" onClick={() => navigate('/battle')}>
              <Swords size={20} />
              <span>Battle</span>
              <small>Challenge friends</small>
            </button>
          </div>

          {/* Categories */}
          {!searchQuery && (
            <>
              <div className="section-header">
                <FolderOpen size={20} />
                <h2>Categories</h2>
              </div>

              {loadingCategories ? (
                <div className="loading-state">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="empty-state">
                  <FolderOpen size={48} />
                  <p>No categories yet for {subjectInfo?.name}</p>
                  <small>Check back later or try Practice Mode</small>
                </div>
              ) : (
                <div className="categories-grid">
                  {categories.map(cat => (
                    <div
                      key={cat._id}
                      className="category-card"
                      onClick={() => setSelectedCategory(cat._id)}
                    >
                      <FolderOpen size={24} style={{ color: cat.color || subjectInfo?.color }} />
                      <div className="category-info">
                        <h4>{cat.name}</h4>
                        <span>{cat.quizCount || 0} quizzes • {cat.questionCount || 0} questions</span>
                      </div>
                      <ChevronRight size={18} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* All Quizzes in Subject */}
          <div className="section-header" style={{ marginTop: 32 }}>
            <FileText size={20} />
            <h2>{searchQuery ? `Search Results for "${searchQuery}"` : 'All Quizzes'}</h2>
          </div>

          {loadingQuizzes ? (
            <div className="loading-state">Loading quizzes...</div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="empty-state small">
              <p>{searchQuery ? 'No quizzes match your search' : 'No quizzes available yet'}</p>
            </div>
          ) : (
            <div className="quizzes-grid">
              {filteredQuizzes.map(quiz => (
                <QuizCard key={quiz._id} quiz={quiz} onStart={() => startQuiz(quiz._id)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Quizzes in Category */}
      {selectedCategory && (
        <>
          {/* Quick Actions */}
          <div className="quick-actions compact">
            <button className="quick-btn practice" onClick={startCustomQuiz}>
              <Play size={18} />
              <span>Practice from this category</span>
            </button>
          </div>

          {/* Quizzes */}
          <div className="section-header">
            <FileText size={20} />
            <h2>Quizzes</h2>
          </div>

          {loadingQuizzes ? (
            <div className="loading-state">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>No quizzes in this category yet</p>
              <button className="btn-secondary" onClick={() => setSelectedCategory(null)}>
                Browse Other Categories
              </button>
            </div>
          ) : (
            <div className="quizzes-list">
              {quizzes.map(quiz => (
                <QuizCard 
                  key={quiz._id} 
                  quiz={quiz} 
                  onStart={() => startQuiz(quiz._id)} 
                  isCompleted={isQuizCompleted(quiz._id)}
                  expanded 
                />
              ))}
            </div>
          )}
        </>
      )}

      <style>{styles}</style>
    </div>
  );
}

// Quiz Card Component
function QuizCard({ quiz, onStart, expanded, isCompleted }) {
  return (
    <div className={`quiz-card ${expanded ? 'expanded' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="quiz-header">
        <div className="quiz-title-row">
          <h4>{quiz.title}</h4>
          {isCompleted && (
            <span className="completed-badge">
              <CheckCircle size={14} /> Done
            </span>
          )}
        </div>
        <span className={`difficulty ${quiz.difficulty || 'medium'}`}>
          {quiz.difficulty || 'mixed'}
        </span>
      </div>
      {expanded && quiz.description && (
        <p className="quiz-desc">{quiz.description}</p>
      )}
      <div className="quiz-meta">
        {quiz.attempts > 0 && <span><Users size={14} /> {quiz.attempts} taken</span>}
        {quiz.avg_score > 0 && <span><Star size={14} /> {Math.round(quiz.avg_score)}% avg</span>}
      </div>
      <button className={`start-btn ${isCompleted ? 'review-btn' : ''}`} onClick={onStart}>
        {isCompleted ? (
          <><Eye size={16} /> Review Answers</>
        ) : (
          <><Zap size={16} /> Start Quiz</>
        )}
      </button>
    </div>
  );
}

const styles = `
  .browse-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px;
  }

  .browse-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .back-btn {
    padding: 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    color: var(--text-primary);
  }

  .back-btn:hover { background: var(--bg-tertiary); }

  .header-content h1 { margin: 0 0 4px; font-size: 1.75rem; }
  .header-content p { margin: 0; color: var(--text-secondary); }

  /* Search Box */
  .search-container {
    position: relative;
    margin-bottom: 24px;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
  }

  .search-input {
    width: 100%;
    padding: 14px 16px 14px 48px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-size: 1rem;
    color: var(--text-primary);
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .search-input::placeholder {
    color: var(--text-tertiary);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border-radius: 10px;
    margin-bottom: 24px;
    font-size: 0.9rem;
  }

  .breadcrumb button {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
  }

  .breadcrumb button:hover { color: var(--text-primary); }
  .breadcrumb .active { color: var(--text-primary); font-weight: 500; }
  .breadcrumb svg { color: var(--text-tertiary); }

  /* Subjects Grid */
  .subjects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }

  .subject-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .subject-card:hover {
    border-color: var(--subject-color);
    transform: translateX(4px);
  }

  .subject-card .subject-icon { font-size: 2rem; }
  .subject-card .subject-info { flex: 1; }
  .subject-card .subject-info h3 { margin: 0; font-size: 1.1rem; }
  .subject-card .arrow { color: var(--text-tertiary); }

  .subject-progress {
    display: flex;
    gap: 12px;
    margin-top: 6px;
  }

  .progress-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--text-tertiary);
  }

  .progress-stat svg {
    color: #10b981;
  }

  /* Quick Actions */
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    margin-bottom: 32px;
  }

  .quick-actions.compact { grid-template-columns: 1fr; }

  .quick-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 20px;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    background: var(--bg-secondary);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .quick-btn:hover { transform: translateY(-2px); }
  
  .quick-btn.practice { border-color: #10b981; color: #10b981; }
  .quick-btn.practice:hover { background: rgba(16, 185, 129, 0.1); }
  
  .quick-btn.random { border-color: #f59e0b; color: #f59e0b; }
  .quick-btn.random:hover { background: rgba(245, 158, 11, 0.1); }
  
  .quick-btn.battle { border-color: #ef4444; color: #ef4444; }
  .quick-btn.battle:hover { background: rgba(239, 68, 68, 0.1); }

  .quick-btn span { font-weight: 600; font-size: 0.95rem; }
  .quick-btn small { font-size: 0.75rem; color: var(--text-tertiary); }

  .quick-actions.compact .quick-btn {
    flex-direction: row;
    justify-content: center;
    padding: 14px 20px;
    color: #10b981;
  }

  /* Section Header */
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    color: var(--text-secondary);
  }

  .section-header h2 { margin: 0; font-size: 1.1rem; }

  /* Categories */
  .categories-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .category-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .category-card:hover {
    border-color: var(--primary);
    background: var(--bg-tertiary);
  }

  .category-info { flex: 1; }
  .category-info h4 { margin: 0 0 4px; font-size: 1rem; }
  .category-info span { font-size: 0.8rem; color: var(--text-tertiary); }

  /* Quizzes */
  .quizzes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .quizzes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .quiz-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 20px;
    transition: all 0.2s;
  }

  .quiz-card:hover { border-color: var(--primary); }

  .quiz-card.expanded { padding: 24px; }

  .quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .quiz-header h4 { margin: 0; font-size: 1rem; }

  .difficulty {
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .difficulty.easy { background: #dcfce7; color: #16a34a; }
  .difficulty.medium { background: #fef3c7; color: #d97706; }
  .difficulty.hard { background: #fee2e2; color: #dc2626; }
  .difficulty.mixed { background: #e0e7ff; color: #4f46e5; }

  .quiz-desc {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0 0 12px;
  }

  .quiz-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 0.8rem;
    color: var(--text-tertiary);
    margin-bottom: 16px;
  }

  .quiz-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .start-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .start-btn:hover { opacity: 0.9; transform: scale(1.02); }

  .start-btn.review-btn {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }

  .start-btn.review-btn:hover {
    background: var(--bg-secondary);
    border-color: var(--primary);
  }

  /* Completed Quiz Styles */
  .quiz-card.completed {
    border-color: #10b981;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.05) 100%);
  }

  .quiz-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  .completed-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: #dcfce7;
    color: #16a34a;
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 6px;
    white-space: nowrap;
  }

  /* States */
  .loading-state, .empty-state {
    padding: 40px;
    text-align: center;
    color: var(--text-tertiary);
    background: var(--bg-secondary);
    border-radius: 14px;
    border: 1px dashed var(--border-color);
  }

  .empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .empty-state.small { padding: 24px; }
  .empty-state p { margin: 0; }
  .empty-state small { font-size: 0.8rem; }

  .btn-secondary {
    padding: 10px 20px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    margin-top: 8px;
  }

  @media (max-width: 640px) {
    .subjects-grid { grid-template-columns: 1fr; }
    .quizzes-grid { grid-template-columns: 1fr; }
    .quick-actions { grid-template-columns: 1fr; }
  }
`;
