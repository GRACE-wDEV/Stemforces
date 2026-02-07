import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import LaTeXRenderer from "../components/common/LaTeXRenderer";
import AIExplanation from "../components/ai/AIExplanation";
import { useAuthStore } from "../stores/authStore";
import api from "../api/axios";

export default function DailyChallengePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime] = useState(Date.now());
  const [showAIExplanation, setShowAIExplanation] = useState(null);

  // Fetch today's challenge from backend
  const { data: challengeData, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: async () => {
      const res = await api.get('/daily-challenge/today');
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5
  });

  // Fetch user's streak
  const { data: streakData } = useQuery({
    queryKey: ['daily-streak'],
    queryFn: async () => {
      const res = await api.get('/daily-challenge/streak');
      return res.data;
    },
    enabled: isAuthenticated
  });

  const streak = streakData?.currentStreak || streakData?.data?.currentStreak || 0;
  const challenge = challengeData;
  const todayCompleted = challenge?.completed;

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async ({ challengeId, answers, timeTaken }) => {
      const res = await api.post('/daily-challenge/submit', { challengeId, answers, timeTaken });
      return res.data;
    },
    onSuccess: (data) => {
      setResults(data.data || data);
      setShowResults(true);
      refetch();
    },
    onError: (err) => {
      console.error('Submit error:', err);
      // Show results locally if backend fails
      const correctCount = challenge.questions.reduce((acc, q, idx) => {
        const userAnswer = selectedAnswers[idx];
        const correctIdx = q.options?.findIndex(o => o.isCorrect) ?? q.correct;
        return acc + (userAnswer === correctIdx ? 1 : 0);
      }, 0);
      setResults({
        score: Math.round((correctCount / challenge.questions.length) * 100),
        correct: correctCount,
        total: challenge.questions.length,
        passed: (correctCount / challenge.questions.length) >= 0.8
      });
      setShowResults(true);
    }
  });

  const handleAnswer = (questionIdx, optionIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmit = () => {
    // Calculate time taken in seconds
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    
    // Format answers for backend
    const answers = {};
    challenge.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] !== undefined) {
        answers[q.id || q._id] = selectedAnswers[idx];
      }
    });
    submitMutation.mutate({ 
      challengeId: challenge.id || challenge._id, 
      answers, 
      timeTaken 
    });
  };

  const getScore = () => {
    if (results) {
      return { correct: results.correct, total: results.total };
    }
    let correct = 0;
    challenge.questions.forEach((q, idx) => {
      const userAnswer = selectedAnswers[idx];
      const correctIdx = q.correct ?? q.options?.findIndex(o => o.isCorrect);
      if (userAnswer === correctIdx) correct++;
    });
    return { correct, total: challenge.questions.length };
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container centered">
        <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div className="icon-large">🔐</div>
          <h3>Login Required</h3>
          <p className="text-secondary">Sign in to access Daily Challenges!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container centered">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="loading-brain">🧠</div>
          <p>Loading today's challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="page-container centered">
        <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div className="icon-large">⚠️</div>
          <h3>Challenge Unavailable</h3>
          <p className="text-secondary">No challenge available today. Check back later!</p>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  if (todayCompleted && !showResults) {
    return (
      <div className="page-container">
        <div className="completed-container">
          <div className="card">
            <div className="icon-large">✅</div>
            <h1>Challenge Complete!</h1>
            <p className="text-secondary">You've completed today's challenge.</p>
            
            {challenge.userScore !== null && (
              <div className="score-badge">
                <span className="score-val">{challenge.userScore}%</span>
                <span className="score-label">Your Score</span>
              </div>
            )}
            
            <div className="streak-display">
              <span className="flame">🔥</span>
              <span className="streak-count">{streak}</span>
              <span className="streak-label">Day Streak</span>
            </div>

            <div className="next-timer">
              <span className="timer-label">Next challenge in:</span>
              <CountdownTimer />
            </div>

            <button className="btn btn-secondary" onClick={() => navigate("/")}>Back to Home</button>
          </div>
        </div>

        <style>{`
          .completed-container { max-width: 500px; margin: 0 auto; text-align: center; }
          .icon-large { font-size: 64px; margin-bottom: 16px; }
          .score-badge { display: flex; flex-direction: column; align-items: center; padding: 16px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 16px; }
          .score-val { font-size: 36px; font-weight: 700; color: var(--primary); }
          .score-label { color: var(--text-secondary); }
          .streak-display { display: flex; flex-direction: column; align-items: center; padding: 24px; background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2)); border-radius: 16px; margin: 24px 0; }
          .flame { font-size: 32px; }
          .streak-count { font-size: 48px; font-weight: 700; color: #f97316; }
          .streak-label { color: var(--text-secondary); }
          .next-timer { margin-bottom: 24px; }
          .timer-label { display: block; color: var(--text-secondary); margin-bottom: 8px; }
        `}</style>
      </div>
    );
  }

  if (showResults) {
    const { correct, total } = getScore();
    const percentage = results?.score ?? Math.round((correct / total) * 100);
    const passed = results?.passed ?? percentage >= 80;

    return (
      <div className="page-container">
        <div className="dc-results">
          <div className={`dc-results-header ${passed ? 'success' : 'failed'}`}>
            <div className="dc-result-icon">{passed ? '🏆' : '💪'}</div>
            <h1>{passed ? 'Challenge Complete!' : 'Nice Try!'}</h1>
            <p>{passed ? 'You maintained your streak!' : 'Need 80% to keep streak.'}</p>
          </div>

          <div className="dc-score-display">
            <div className="dc-score-circle"><span className="dc-score-value">{percentage}%</span></div>
            <div className="dc-score-details">
              <span>{correct}/{total} correct</span>
              {passed && results?.xpEarned && <span className="dc-xp-earned">+{results.xpEarned} XP</span>}
            </div>
          </div>

          {passed && (
            <div className="dc-streak-celebration">
              <span>🔥</span> <span className="dc-streak-num">{streak + 1}</span> Day Streak!
            </div>
          )}

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Question Breakdown</h3>
            {challenge.questions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const correctIdx = q.correct ?? q.options?.findIndex(o => o.isCorrect);
              const isCorrect = userAnswer === correctIdx;
              const options = q.options?.map(o => typeof o === 'string' ? o : o.text) || [];

              return (
                <div key={q.id || q._id || idx} className={`dc-q-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="dc-q-header">
                    <div className="dc-q-left">
                      <span className="dc-q-num">Q{idx + 1}</span>
                      <span className="dc-q-subject">{q.subject}</span>
                    </div>
                    <span className={`dc-q-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <div className="dc-q-text"><LaTeXRenderer content={q.question || q.title} /></div>

                  <div className="dc-options-review">
                    {options.map((opt, oIdx) => {
                      const isThisCorrect = oIdx === correctIdx;
                      const isUserPick = oIdx === userAnswer;
                      let cls = 'dc-opt-review';
                      if (isThisCorrect) cls += ' correct-opt';
                      else if (isUserPick && !isCorrect) cls += ' wrong-opt';

                      return (
                        <div key={oIdx} className={cls}>
                          <span className="dc-opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                          <span className="dc-opt-text"><LaTeXRenderer content={opt} /></span>
                          {isThisCorrect && <span className="dc-opt-tag correct-tag">✓ Correct</span>}
                          {isUserPick && !isCorrect && <span className="dc-opt-tag your-tag">Your answer</span>}
                          {isUserPick && isCorrect && <span className="dc-opt-tag your-correct-tag">✓ Your answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="dc-q-actions">
                    <button
                      className="dc-ai-btn"
                      onClick={() => setShowAIExplanation({
                        question: q.question || q.title,
                        userAnswer: userAnswer !== undefined ? options[userAnswer] : 'No answer',
                        correctAnswer: options[correctIdx] || '',
                        subject: q.subject
                      })}
                    >
                      🤖 AI Explanation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="dc-bottom-actions">
            <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
          </div>
        </div>

        {showAIExplanation && (
          <AIExplanation
            question={showAIExplanation.question}
            userAnswer={showAIExplanation.userAnswer}
            correctAnswer={showAIExplanation.correctAnswer}
            subject={showAIExplanation.subject}
            onClose={() => setShowAIExplanation(null)}
          />
        )}

        <style>{`
          .dc-results { max-width: 750px; margin: 0 auto; padding-bottom: 100px; }
          .dc-results-header { text-align: center; padding: 40px; border-radius: 16px; margin-bottom: 24px; }
          .dc-results-header.success { background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2)); }
          .dc-results-header.failed { background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2)); }
          .dc-result-icon { font-size: 64px; margin-bottom: 16px; }
          .dc-score-display { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 24px; }
          .dc-score-circle { width: 100px; height: 100px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border: 4px solid var(--primary); }
          .dc-score-value { font-size: 28px; font-weight: 700; }
          .dc-score-details { display: flex; flex-direction: column; gap: 4px; }
          .dc-xp-earned { color: #22c55e; font-weight: 600; }
          .dc-streak-celebration { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; color: white; font-weight: 600; font-size: 20px; margin-bottom: 24px; }
          .dc-streak-num { font-size: 28px; }

          .dc-q-item { padding: 20px; border-radius: 12px; margin-bottom: 16px; border-left: 4px solid; }
          .dc-q-item.correct { background: rgba(34, 197, 94, 0.04); border-left-color: #22c55e; }
          .dc-q-item.incorrect { background: rgba(239, 68, 68, 0.04); border-left-color: #ef4444; }

          .dc-q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; flex-wrap: wrap; }
          .dc-q-left { display: flex; align-items: center; gap: 10px; }
          .dc-q-num { font-weight: 700; font-size: 0.9rem; color: var(--text-secondary); }
          .dc-q-subject { font-size: 0.75rem; padding: 3px 10px; background: var(--bg-tertiary); border-radius: 20px; color: var(--text-secondary); }
          .dc-q-badge { font-size: 0.8rem; font-weight: 600; padding: 4px 12px; border-radius: 6px; }
          .dc-q-badge.correct { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
          .dc-q-badge.incorrect { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

          .dc-q-text { font-size: 1rem; line-height: 1.6; margin-bottom: 16px; }

          .dc-options-review { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
          .dc-opt-review {
            display: flex; align-items: center; gap: 12px; padding: 12px 14px;
            border-radius: 10px; border: 1.5px solid var(--border-color); background: var(--bg-secondary);
            transition: none;
          }
          .dc-opt-review.correct-opt { border-color: #22c55e; background: rgba(34, 197, 94, 0.08); }
          .dc-opt-review.wrong-opt { border-color: #ef4444; background: rgba(239, 68, 68, 0.08); }
          .dc-opt-letter {
            width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
            background: var(--bg-tertiary); border-radius: 6px; font-weight: 600; font-size: 0.85rem; flex-shrink: 0;
          }
          .correct-opt .dc-opt-letter { background: #22c55e; color: white; }
          .wrong-opt .dc-opt-letter { background: #ef4444; color: white; }
          .dc-opt-text { flex: 1; font-size: 0.9rem; }
          .dc-opt-tag { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; flex-shrink: 0; }
          .correct-tag { background: rgba(34, 197, 94, 0.2); color: #16a34a; }
          .your-tag { background: rgba(239, 68, 68, 0.2); color: #dc2626; }
          .your-correct-tag { background: rgba(34, 197, 94, 0.2); color: #16a34a; }

          .dc-q-actions { display: flex; gap: 8px; }
          .dc-ai-btn {
            padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-color);
            background: var(--bg-secondary); cursor: pointer; font-size: 0.85rem; font-weight: 500;
            color: var(--text-primary); transition: all 0.2s;
          }
          .dc-ai-btn:hover { border-color: var(--primary); background: rgba(99, 102, 241, 0.08); }

          .dc-bottom-actions { margin-top: 24px; display: flex; justify-content: center; }

          @media (max-width: 600px) {
            .dc-results { padding-bottom: 120px; }
            .dc-q-header { flex-direction: column; align-items: flex-start; }
          }
        `}</style>
      </div>
    );
  }

  const questions = challenge.questions || [];
  if (questions.length === 0) {
    return (
      <div className="page-container centered">
        <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div className="icon-large">📝</div>
          <h3>No Questions</h3>
          <p className="text-secondary">Today's challenge has no questions yet.</p>
          <button className="btn btn-secondary" onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const options = question.options?.map(o => typeof o === 'string' ? o : o.text) || [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="page-container daily-challenge">
      <div className="challenge-header">
        <div className="header-left">
          <span className="challenge-icon">⚡</span>
          <div>
            <h1>Daily Challenge</h1>
            <p className="text-secondary">{challenge.title || challenge.theme || "Today's Challenge"}</p>
          </div>
        </div>
        <div className="streak-badge">🔥 {streak}</div>
      </div>

      <div className="progress-section">
        <div className="progress-info">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="card question-card">
        <span className="subject-tag">{question.subject}</span>
        <div className="question-text"><LaTeXRenderer content={question.question || question.title} /></div>

        <div className="options-list">
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(currentQuestion, idx)}
              className={`option-btn ${selectedAnswers[currentQuestion] === idx ? 'selected' : ''}`}
            >
              <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="option-text"><LaTeXRenderer content={option} /></span>
            </button>
          ))}
        </div>

        <div className="navigation">
          <button className="btn btn-secondary" onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} disabled={currentQuestion === 0}>← Previous</button>
          {currentQuestion === questions.length - 1 ? (
            <button 
              className="btn btn-success" 
              onClick={handleSubmit} 
              disabled={Object.keys(selectedAnswers).length < questions.length || submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setCurrentQuestion(prev => prev + 1)}>Next →</button>
          )}
        </div>
      </div>

      <div className="question-dots">
        {questions.map((_, idx) => (
          <button key={idx} onClick={() => setCurrentQuestion(idx)} className={`dot ${idx === currentQuestion ? 'current' : ''} ${selectedAnswers[idx] !== undefined ? 'answered' : ''}`}>{idx + 1}</button>
        ))}
      </div>

      <style>{`
        .centered { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
        .loading-brain { font-size: 64px; animation: bounce 1s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .daily-challenge { max-width: 800px; margin: 0 auto; padding-bottom: 80px; }
        .challenge-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .challenge-icon { font-size: 40px; }
        .challenge-header h1 { margin: 0; }
        .streak-badge { padding: 12px 20px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 30px; font-weight: 700; font-size: 18px; color: white; }
        .progress-section { margin-bottom: 24px; }
        .progress-info { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: var(--text-secondary); }
        .progress-bar { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #f97316, #ea580c); transition: width 0.3s ease; }
        .question-card { margin-bottom: 24px; }
        .subject-tag { display: inline-block; padding: 6px 12px; background: var(--bg-secondary); border-radius: 20px; font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 20px; }
        .question-text { font-size: 18px; line-height: 1.6; margin-bottom: 24px; }
        .options-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .option-btn { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: 12px; text-align: left; cursor: pointer; transition: all 0.2s; }
        .option-btn:hover { border-color: var(--primary); }
        .option-btn.selected { border-color: #f97316; background: rgba(249, 115, 22, 0.1); }
        .option-letter { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: 8px; font-weight: 600; }
        .option-btn.selected .option-letter { background: #f97316; color: white; }
        .option-text { flex: 1; }
        .navigation { display: flex; justify-content: space-between; }
        .btn-success { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; }
        .question-dots { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .dot { width: 36px; height: 36px; border-radius: 8px; background: var(--bg-secondary); border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s; }
        .dot.current { background: #f97316; border-color: #f97316; color: white; }
        .dot.answered { background: rgba(34, 197, 94, 0.2); border-color: #22c55e; }
      `}</style>
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{timeLeft}</span>;
}
