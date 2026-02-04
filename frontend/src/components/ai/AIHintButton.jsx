import { useState } from "react";
import { getHint } from "../../api/ai";
import LaTeXRenderer from "../common/LaTeXRenderer";

export default function AIHintButton({ question, options, subject, disabled }) {
  const [hints, setHints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchHint = async () => {
    if (hints.length >= 3) return; // Max 3 hints
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getHint(
        question,
        options,
        subject,
        hints.length + 1
      );
      
      if (response.success && response.data?.hint) {
        setHints(prev => [...prev, response.data.hint]);
        setIsOpen(true);
        setError(null);
      } else if (response.message) {
        setError(response.message || "AI service unavailable");
        // Still open panel to show error
        if (hints.length === 0) setIsOpen(true);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Hint fetch error:", err);
      setError(err.message || "Couldn't get hint. Try again.");
      if (hints.length === 0) setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const hintLabels = ["First hint", "More specific hint", "Final hint"];

  return (
    <div className="ai-hint-container">
      <button
        onClick={fetchHint}
        disabled={disabled || isLoading || hints.length >= 3}
        className="ai-hint-btn"
      >
        {isLoading ? (
          <>
            <span className="spinner" />
            Getting hint...
          </>
        ) : hints.length >= 3 ? (
          <>
            <span className="hint-icon">💡</span>
            No more hints
          </>
        ) : (
          <>
            <span className="hint-icon">💡</span>
            {hints.length === 0 ? "Get AI Hint" : `Get More Hints (${3 - hints.length} left)`}
          </>
        )}
      </button>

      {/* Hint indicator */}
      {hints.length > 0 && (
        <div className="hint-dots">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`hint-dot ${i < hints.length ? "used" : ""}`}
            />
          ))}
        </div>
      )}

      {/* Hints panel */}
      {isOpen && hints.length > 0 && (
        <div className="hints-panel">
          <div className="hints-header">
            <h4>💡 AI Hints</h4>
            <button onClick={() => setIsOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          
          <div className="hints-list">
            {hints.map((hint, idx) => (
              <div key={idx} className="hint-item">
                <span className="hint-label">{hintLabels[idx]}</span>
                <LaTeXRenderer content={hint} />
              </div>
            ))}
          </div>
          
          {hints.length < 3 && (
            <button 
              onClick={fetchHint}
              disabled={isLoading}
              className="more-hint-btn"
            >
              {isLoading ? "Loading..." : `Need more help? (${3 - hints.length} hints left)`}
            </button>
          )}
          
          {error && <p className="hint-error">{error}</p>}
        </div>
      )}

      <style>{`
        .ai-hint-container {
          position: relative;
        }

        .ai-hint-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none;
          border-radius: 10px;
          color: #1a1a1a;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ai-hint-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }

        .ai-hint-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .hint-icon {
          font-size: 16px;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hint-dots {
          display: flex;
          gap: 4px;
          justify-content: center;
          margin-top: 8px;
        }

        .hint-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }

        .hint-dot.used {
          background: #fbbf24;
          border-color: #f59e0b;
        }

        .hints-panel {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          right: 0;
          min-width: 300px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          z-index: 100;
          animation: fadeSlide 0.2s ease;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hints-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hints-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .hints-header button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .hints-header button:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        .hints-list {
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hint-item {
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          border-left: 3px solid #fbbf24;
        }

        .hint-label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #f59e0b;
          margin-bottom: 6px;
        }

        .hint-item p {
          margin: 0;
          color: var(--text-primary);
          font-size: 13px;
          line-height: 1.5;
        }

        .more-hint-btn {
          width: 100%;
          padding: 10px;
          background: var(--bg-secondary);
          border: 1px dashed var(--border-color);
          border-radius: 0 0 12px 12px;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .more-hint-btn:hover:not(:disabled) {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border-color: #fbbf24;
        }

        .more-hint-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .hint-error {
          margin: 0;
          padding: 8px 16px;
          text-align: center;
          color: #ef4444;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
