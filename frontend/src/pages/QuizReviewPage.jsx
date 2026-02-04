import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, BookOpen } from 'lucide-react';
import LaTeXRenderer from '../components/common/LaTeXRenderer';
import api from '../api/axios';

export default function QuizReviewPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const { data: reviewData, isLoading, error } = useQuery({
    queryKey: ['quiz-review', quizId],
    queryFn: async () => {
      const res = await api.get(`/quizzes/${quizId}/review`);
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="review-page">
        <div className="loading-card">
          <div className="spinner" />
          <p>Loading your quiz review...</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-page">
        <div className="error-card">
          <div className="error-icon">❌</div>
          <h2>Unable to Load Review</h2>
          <p>{error.response?.data?.message || error.message}</p>
          <button className="btn-back" onClick={() => navigate('/browse')}>
            <ArrowLeft size={18} /> Back to Browse
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  const { quizTitle, subject, score, questionsCorrect, questionsTotal, completedAt, questions } = reviewData;

  return (
    <div className="review-page">
      {/* Header */}
      <div className="review-header">
        <button className="btn-back" onClick={() => navigate('/browse')}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="header-content">
          <h1>{quizTitle}</h1>
          <p className="subtitle">{subject} • Completed {new Date(completedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Score Summary */}
      <div className="score-card">
        <div className="score-main">
          <div className={`score-circle ${score >= 80 ? 'great' : score >= 60 ? 'good' : 'needs-work'}`}>
            <span className="score-value">{score}%</span>
          </div>
          <div className="score-details">
            <h2>Your Score</h2>
            <p>{questionsCorrect} of {questionsTotal} correct</p>
          </div>
        </div>
        <div className="score-badge">
          {score >= 80 ? (
            <><Award size={20} /> Great Job!</>
          ) : score >= 60 ? (
            <><BookOpen size={20} /> Good Effort</>
          ) : (
            <><BookOpen size={20} /> Keep Practicing</>
          )}
        </div>
      </div>

      {/* Questions Review */}
      <div className="questions-section">
        <h2>Question Review</h2>
        <p className="section-desc">Review what you got right and wrong</p>

        <div className="questions-list">
          {questions.map((q, idx) => {
            return (
              <div key={q.id} className="question-card">
                <div className="question-header">
                  <span className="question-num">Q{idx + 1}</span>
                  <span className={`difficulty ${q.difficulty || 'medium'}`}>
                    {q.difficulty || 'Medium'}
                  </span>
                </div>
                
                <div className="question-text">
                  <LaTeXRenderer content={q.question || q.title} />
                </div>

                <div className="choices-list">
                  {q.choices?.map((choice, cIdx) => (
                    <div 
                      key={choice.id || cIdx} 
                      className={`choice ${choice.isCorrect ? 'correct' : ''}`}
                    >
                      <span className="choice-letter">{String.fromCharCode(65 + cIdx)}</span>
                      <span className="choice-text">
                        <LaTeXRenderer content={choice.text} />
                      </span>
                      {choice.isCorrect && <CheckCircle size={18} className="correct-icon" />}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="explanation">
                    <strong>Explanation:</strong>
                    <LaTeXRenderer content={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .review-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    padding-bottom: 80px;
  }

  .loading-card, .error-card {
    text-align: center;
    padding: 60px 40px;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 1px solid var(--border-color);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .error-icon { font-size: 48px; margin-bottom: 16px; }

  .review-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  .btn-back {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    cursor: pointer;
    color: var(--text-primary);
    font-weight: 500;
  }

  .btn-back:hover { background: var(--bg-tertiary); }

  .header-content h1 { margin: 0 0 4px; font-size: 1.5rem; }
  .header-content .subtitle { margin: 0; color: var(--text-secondary); font-size: 0.9rem; }

  .score-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    margin-bottom: 32px;
  }

  .score-main {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .score-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .score-circle.great { background: #dcfce7; color: #16a34a; }
  .score-circle.good { background: #fef3c7; color: #d97706; }
  .score-circle.needs-work { background: #fee2e2; color: #dc2626; }

  .score-details h2 { margin: 0 0 4px; font-size: 1.2rem; }
  .score-details p { margin: 0; color: var(--text-secondary); }

  .score-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--bg-tertiary);
    border-radius: 20px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .questions-section h2 { margin: 0 0 4px; font-size: 1.2rem; }
  .questions-section .section-desc { margin: 0 0 20px; color: var(--text-secondary); }

  .questions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .question-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 20px;
  }

  .question-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .question-num {
    font-weight: 700;
    color: var(--primary);
    font-size: 0.9rem;
  }

  .difficulty {
    font-size: 0.65rem;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .difficulty.easy { background: #dcfce7; color: #16a34a; }
  .difficulty.medium, .difficulty.Medium { background: #fef3c7; color: #d97706; }
  .difficulty.hard, .difficulty.Hard { background: #fee2e2; color: #dc2626; }

  .question-text {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .choices-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .choice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg-tertiary);
    border: 1px solid transparent;
    border-radius: 10px;
    transition: all 0.2s;
  }

  .choice.correct {
    background: #dcfce7;
    border-color: #10b981;
  }

  .choice-letter {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  .choice.correct .choice-letter {
    background: #10b981;
    color: white;
  }

  .choice-text { flex: 1; }

  .correct-icon {
    color: #10b981;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .explanation {
    padding: 14px;
    background: #eff6ff;
    border-radius: 10px;
    font-size: 0.9rem;
    color: #1e40af;
    line-height: 1.5;
  }

  .explanation strong {
    display: block;
    margin-bottom: 6px;
  }

  @media (max-width: 640px) {
    .score-card {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .score-main {
      flex-direction: column;
    }
  }
`;
