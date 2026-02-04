import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const SUBJECTS = [
  { id: "Math", name: "Mathematics", icon: "📐", color: "#3b82f6", gradient: "from-blue-500 to-indigo-600" },
  { id: "Physics", name: "Physics", icon: "⚛️", color: "#8b5cf6", gradient: "from-violet-500 to-purple-600" },
  { id: "Chemistry", name: "Chemistry", icon: "🧪", color: "#10b981", gradient: "from-emerald-500 to-teal-600" },
  { id: "Biology", name: "Biology", icon: "🧬", color: "#f59e0b", gradient: "from-amber-500 to-orange-600" },
];

export default function QuizBrowser() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [sources, setSources] = useState([]);
  const [topics, setTopics] = useState([]);
  const [, setLoading] = useState(false);
  const [questionCounts, setQuestionCounts] = useState({});
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [quizConfig, setQuizConfig] = useState({
    count: 10,
    difficulty: "all",
    timeLimit: 60
  });

  // Fetch sources and topics when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectData(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchSubjectData = async (subject) => {
    setLoading(true);
    try {
      const response = await api.get(`/questions/browse/${subject}`);
      if (response.data.success) {
        setSources(response.data.sources || []);
        setTopics(response.data.topics || []);
        setQuestionCounts(response.data.counts || {});
      }
    } catch (error) {
      console.error("Error fetching subject data:", error);
      // Fallback to mock data for demo
      setSources(["URT Sample Test", "URT Model (3mr)", "Math & Mechanics URT"]);
      setTopics(["Probability", "Algebra", "Calculus", "Geometry", "Trigonometry"]);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    const params = new URLSearchParams({
      subject: selectedSubject,
      ...(selectedSource && { source: selectedSource }),
      ...(selectedTopic && { topic: selectedTopic }),
      count: quizConfig.count,
      difficulty: quizConfig.difficulty,
      timeLimit: quizConfig.timeLimit
    });
    navigate(`/quiz/custom?${params.toString()}`);
  };

  const handleSubjectClick = (subjectId) => {
    setSelectedSubject(subjectId);
    setSelectedSource(null);
    setSelectedTopic(null);
  };

  return (
    <div className="quiz-browser">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>🎯 Choose Your Challenge</h1>
        <p>Select a subject to start your learning journey</p>
      </div>

      {/* Subject Cards */}
      <div className="subjects-grid">
        {SUBJECTS.map((subject) => (
          <div
            key={subject.id}
            className={`subject-card ${selectedSubject === subject.id ? 'selected' : ''}`}
            onClick={() => handleSubjectClick(subject.id)}
            style={{ '--subject-color': subject.color }}
          >
            <div className="subject-icon">{subject.icon}</div>
            <h3>{subject.name}</h3>
            <span className="question-count">
              {questionCounts[subject.id] || '50+'} questions
            </span>
            {selectedSubject === subject.id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      {/* Filters Section - Shows when subject is selected */}
      {selectedSubject && (
        <div className="filters-section animate-slide-up">
          <h2>🎓 Customize Your Quiz</h2>
          
          {/* Source Filter */}
          <div className="filter-group">
            <label>📚 Select Source (Optional)</label>
            <div className="filter-chips">
              <button
                className={`chip ${!selectedSource ? 'active' : ''}`}
                onClick={() => setSelectedSource(null)}
              >
                All Sources
              </button>
              {sources.map((source) => (
                <button
                  key={source}
                  className={`chip ${selectedSource === source ? 'active' : ''}`}
                  onClick={() => setSelectedSource(source)}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filter */}
          <div className="filter-group">
            <label>📖 Select Topic (Optional)</label>
            <div className="filter-chips">
              <button
                className={`chip ${!selectedTopic ? 'active' : ''}`}
                onClick={() => setSelectedTopic(null)}
              >
                All Topics
              </button>
              {topics.map((topic) => (
                <button
                  key={topic}
                  className={`chip ${selectedTopic === topic ? 'active' : ''}`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Start Options */}
          <div className="quiz-options">
            <div className="option-group">
              <label>⏱️ Questions</label>
              <div className="option-buttons">
                {[5, 10, 20, 30].map((n) => (
                  <button
                    key={n}
                    className={`option-btn ${quizConfig.count === n ? 'active' : ''}`}
                    onClick={() => setQuizConfig(prev => ({ ...prev, count: n }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>🎚️ Difficulty</label>
              <div className="option-buttons">
                {['all', 'easy', 'medium', 'hard'].map((d) => (
                  <button
                    key={d}
                    className={`option-btn ${quizConfig.difficulty === d ? 'active' : ''}`}
                    onClick={() => setQuizConfig(prev => ({ ...prev, difficulty: d }))}
                  >
                    {d === 'all' ? '🎲 Mix' : d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>⏰ Time per Question</label>
              <div className="option-buttons">
                {[30, 60, 90, 120].map((t) => (
                  <button
                    key={t}
                    className={`option-btn ${quizConfig.timeLimit === t ? 'active' : ''}`}
                    onClick={() => setQuizConfig(prev => ({ ...prev, timeLimit: t }))}
                  >
                    {t}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button className="start-quiz-btn" onClick={startQuiz}>
            🚀 Start Quiz
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>⚡ Quick Play</h2>
        <div className="quick-buttons">
          <button className="quick-btn daily" onClick={() => navigate('/daily-challenge')}>
            <span className="quick-icon">🔥</span>
            <span className="quick-text">Daily Challenge</span>
            <span className="quick-badge">+50 XP</span>
          </button>
          <button className="quick-btn battle" onClick={() => navigate('/battle')}>
            <span className="quick-icon">⚔️</span>
            <span className="quick-text">Battle Mode</span>
            <span className="quick-badge">PvP</span>
          </button>
          <button className="quick-btn random" onClick={() => {
            const randomSubject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
            navigate(`/quiz/random?subject=${randomSubject.id}&count=10`);
          }}>
            <span className="quick-icon">🎲</span>
            <span className="quick-text">Random Quiz</span>
            <span className="quick-badge">Surprise!</span>
          </button>
        </div>
      </div>

      <style>{`
        .quiz-browser {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .hero-section {
          text-align: center;
          margin-bottom: 40px;
        }

        .hero-section h1 {
          font-size: 2.5rem;
          margin-bottom: 8px;
          background: linear-gradient(135deg, var(--primary), #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-section p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        /* Subject Cards */
        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .subject-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 20px;
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .subject-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--subject-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .subject-card:hover {
          transform: translateY(-4px);
          border-color: var(--subject-color);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
        }

        .subject-card:hover::before {
          transform: scaleX(1);
        }

        .subject-card.selected {
          border-color: var(--subject-color);
          background: linear-gradient(135deg, var(--bg-secondary), rgba(var(--subject-color), 0.1));
        }

        .subject-card.selected::before {
          transform: scaleX(1);
        }

        .subject-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .subject-card h3 {
          margin: 0 0 8px;
          font-size: 1.25rem;
        }

        .question-count {
          font-size: 0.85rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .selected-indicator {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 24px;
          height: 24px;
          background: var(--subject-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        /* Filters Section */
        .filters-section {
          background: var(--bg-secondary);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 40px;
          border: 1px solid var(--border-color);
        }

        .filters-section h2 {
          margin: 0 0 24px;
          text-align: center;
        }

        .filter-group {
          margin-bottom: 24px;
        }

        .filter-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip {
          padding: 10px 18px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .chip:hover {
          border-color: var(--primary);
        }

        .chip.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        /* Quiz Options */
        .quiz-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .option-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .option-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .option-btn {
          padding: 10px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .option-btn:hover {
          border-color: var(--primary);
        }

        .option-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        /* Start Button */
        .start-quiz-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, var(--primary), #a855f7);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }

        .start-quiz-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
        }

        /* Quick Actions */
        .quick-actions {
          margin-top: 40px;
        }

        .quick-actions h2 {
          text-align: center;
          margin-bottom: 24px;
        }

        .quick-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .quick-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          border-radius: 16px;
          border: 2px solid var(--border-color);
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .quick-btn:hover {
          transform: translateY(-4px);
        }

        .quick-btn.daily {
          border-color: #f59e0b;
        }
        .quick-btn.daily:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .quick-btn.battle {
          border-color: #ef4444;
        }
        .quick-btn.battle:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .quick-btn.random {
          border-color: #8b5cf6;
        }
        .quick-btn.random:hover {
          background: rgba(139, 92, 246, 0.1);
        }

        .quick-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .quick-text {
          font-weight: 600;
          font-size: 1rem;
        }

        .quick-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 20px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .quick-btn.daily .quick-badge {
          background: #fef3c7;
          color: #92400e;
        }

        .quick-btn.battle .quick-badge {
          background: #fee2e2;
          color: #991b1b;
        }

        .quick-btn.random .quick-badge {
          background: #ede9fe;
          color: #5b21b6;
        }

        /* Animation */
        .animate-slide-up {
          animation: slideUp 0.4s ease forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 1.8rem;
          }
          
          .subjects-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .quiz-options {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
