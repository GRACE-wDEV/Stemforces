import { useState, useEffect } from "react";
import { explainWrongAnswer } from "../../api/ai";
import LaTeXRenderer from "../common/LaTeXRenderer";

export default function AIExplanation({ question, userAnswer, correctAnswer, subject, onClose }) {
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExplanation = async () => {
    if (explanation) return; // Already have explanation
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await explainWrongAnswer(
        question,
        userAnswer,
        correctAnswer,
        subject
      );
      
      if (response.success && response.data?.explanation) {
        setExplanation(response.data.explanation);
        setError(null);
      } else if (response.error) {
        setError(response.message || "AI service is currently unavailable");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Explanation fetch error:", err);
      setError(err.message || "Couldn't get AI explanation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount (using useEffect, not useState)
  useEffect(() => {
    fetchExplanation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ai-explanation-overlay" onClick={onClose}>
      <div className="ai-explanation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-explanation-header">
          <div className="ai-explanation-icon">🧠</div>
          <div>
            <h3>AI Explanation</h3>
            <p>Let me help you understand</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ai-explanation-question">
          <span className="label">Question</span>
          <LaTeXRenderer content={question} />
        </div>

        <div className="ai-explanation-answers">
          <div className="answer wrong">
            <span className="label">Your Answer</span>
            <LaTeXRenderer content={userAnswer} />
          </div>
          <div className="answer correct">
            <span className="label">Correct Answer</span>
            <LaTeXRenderer content={correctAnswer} />
          </div>
        </div>

        <div className="ai-explanation-content">
          {isLoading && (
            <div className="loading-state">
              <div className="ai-thinking">
                <span className="brain-icon">🧠</span>
                <span>AI is analyzing...</span>
              </div>
              <div className="loading-bar">
                <div className="loading-progress" />
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchExplanation}>Try Again</button>
            </div>
          )}
          
          {explanation && (
            <div className="explanation-text">
              <LaTeXRenderer content={explanation} />
            </div>
          )}
        </div>

        <div className="ai-explanation-footer">
          <button className="btn-secondary" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>

      <style>{`
        .ai-explanation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ai-explanation-modal {
          background: var(--bg-primary);
          border-radius: 16px;
          width: 100%;
          max-width: 560px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-color);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .ai-explanation-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ai-explanation-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary) 0%, #a855f7 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .ai-explanation-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .ai-explanation-header p {
          margin: 2px 0 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .close-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .ai-explanation-question {
          padding: 16px 20px;
          background: var(--bg-secondary);
        }

        .label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .ai-explanation-question p {
          margin: 0;
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.6;
        }

        .ai-explanation-answers {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: var(--border-color);
        }

        .answer {
          padding: 14px 20px;
          background: var(--bg-primary);
        }

        .answer.wrong {
          border-left: 3px solid #ef4444;
        }

        .answer.correct {
          border-left: 3px solid #22c55e;
        }

        .answer p {
          margin: 0;
          color: var(--text-primary);
          font-size: 13px;
        }

        .ai-explanation-content {
          padding: 20px;
          min-height: 120px;
        }

        .loading-state {
          text-align: center;
          padding: 20px;
        }

        .ai-thinking {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 16px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .brain-icon {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .loading-bar {
          height: 4px;
          background: var(--bg-secondary);
          border-radius: 2px;
          overflow: hidden;
          max-width: 200px;
          margin: 0 auto;
        }

        .loading-progress {
          height: 100%;
          width: 30%;
          background: linear-gradient(90deg, var(--primary), #a855f7);
          border-radius: 2px;
          animation: loadingSlide 1.5s infinite;
        }

        @keyframes loadingSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        .error-state {
          text-align: center;
          padding: 20px;
          color: #ef4444;
        }

        .error-state button {
          margin-top: 12px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .explanation-text {
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.7;
        }

        .explanation-text p {
          margin: 0 0 12px;
        }

        .explanation-text ul, .explanation-text ol {
          margin: 0 0 12px;
          padding-left: 20px;
        }

        .explanation-text li {
          margin-bottom: 6px;
        }

        .ai-explanation-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
          border-color: var(--primary);
        }

        @media (max-width: 480px) {
          .ai-explanation-answers {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
