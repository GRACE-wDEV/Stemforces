import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios.js";
import QuestionCard from "../components/QuestionCard";
import { breakdownConcept } from "../api/ai";
import LaTeXRenderer from "../components/common/LaTeXRenderer";

export default function QuestionsPage() {
  const { subject, source } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [conceptBreakdown, setConceptBreakdown] = useState(null);
  const [loadingConcept, setLoadingConcept] = useState(false);
  const [conceptTopic, setConceptTopic] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["questions", subject, source],
    queryFn: async () => {
      const res = await api.get(`/questions?subject=${subject}&source=${source}`);
      return res.data;
    }
  });

  const handleConceptBreakdown = async () => {
    if (!conceptTopic.trim() || loadingConcept) return;
    
    setLoadingConcept(true);
    try {
      const response = await breakdownConcept(conceptTopic, subject, "intermediate");
      if (response.success) {
        setConceptBreakdown(response.data.message);
      }
    } catch (error) {
      console.error("Error getting concept breakdown:", error);
    } finally {
      setLoadingConcept(false);
    }
  };

  // Filter questions
  const filteredQuestions = data?.questions?.filter(q => {
    const matchesSearch = !searchQuery || 
      q.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === "all" || 
      q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
    
    return matchesSearch && matchesDifficulty;
  }) || [];

  if (isLoading) {
    return (
      <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="spinner-large" />
          <p className="text-secondary">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h3>Error Loading Questions</h3>
          <p className="text-secondary">Unable to fetch questions. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="questions-header">
        <div className="header-info">
          <span className="subject-icon">
            {subject === 'Math' ? '📐' : 
             subject === 'Physics' ? '⚡' : 
             subject === 'Chemistry' ? '🧪' : '🧬'}
          </span>
          <div>
            <h1>{subject} Questions</h1>
            <p className="text-secondary">
              Source: {source} • {data?.questions?.length || 0} questions
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-row">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="difficulty-filters">
            {["all", "easy", "medium", "hard"].map(diff => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`filter-btn ${difficultyFilter === diff ? 'active' : ''}`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Concept Breakdown */}
      <div className="card ai-concept-card">
        <div className="ai-header">
          <span className="ai-icon">🤖</span>
          <div>
            <h3>AI Concept Breakdown</h3>
            <p className="text-secondary">Struggling with a topic? Let AI explain it simply.</p>
          </div>
        </div>
        
        <div className="concept-input-row">
          <input
            type="text"
            placeholder={`e.g., "Quadratic Formula" or "Newton's Laws"`}
            value={conceptTopic}
            onChange={(e) => setConceptTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleConceptBreakdown()}
            className="input-field"
          />
          <button 
            className="btn btn-primary"
            onClick={handleConceptBreakdown}
            disabled={loadingConcept || !conceptTopic.trim()}
          >
            {loadingConcept ? 'Analyzing...' : 'Explain'}
          </button>
        </div>

        {conceptBreakdown && (
          <div className="concept-result">
            <LaTeXRenderer content={conceptBreakdown} />
          </div>
        )}
      </div>

      {/* Questions Grid */}
      {filteredQuestions.length > 0 ? (
        <div className="questions-grid">
          {filteredQuestions.map((question, index) => (
            <div 
              key={question._id} 
              className="question-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <QuestionCard question={question} />
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <h3>No Questions Found</h3>
          <p className="text-secondary">
            {searchQuery || difficultyFilter !== 'all' 
              ? "No questions match your filters. Try adjusting your search."
              : `No questions available for ${subject} from ${source}.`}
          </p>
        </div>
      )}

      <style>{`
        .questions-header {
          margin-bottom: 24px;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .subject-icon {
          font-size: 48px;
          width: 80px;
          height: 80px;
          background: var(--bg-secondary);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-info h1 {
          margin: 0 0 4px;
        }

        .filters-card {
          margin-bottom: 24px;
        }

        .filters-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
        }

        .search-input .input-field {
          padding-left: 44px;
          width: 100%;
        }

        .difficulty-filters {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 10px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: var(--primary);
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .ai-concept-card {
          margin-bottom: 24px;
        }

        .ai-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .ai-icon {
          font-size: 32px;
        }

        .ai-header h3 {
          margin: 0;
        }

        .ai-header p {
          margin: 0;
        }

        .concept-input-row {
          display: flex;
          gap: 12px;
        }

        .concept-input-row .input-field {
          flex: 1;
        }

        .concept-result {
          margin-top: 20px;
          padding: 20px;
          background: var(--bg-secondary);
          border-radius: 12px;
          border-left: 4px solid var(--primary);
          line-height: 1.7;
        }

        .questions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .question-item {
          animation: fadeSlideUp 0.3s ease forwards;
          opacity: 0;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid var(--bg-tertiary);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .filters-row {
            flex-direction: column;
          }

          .difficulty-filters {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
