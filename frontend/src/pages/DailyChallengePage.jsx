import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import LaTeXRenderer from "../components/common/LaTeXRenderer";
import { useAuthStore } from "../stores/authStore";
import api from "../api/axios";

export default function DailyChallengePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime] = useState(Date.now()); // Track when user started

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
        <div className="results-container">
          <div className={`results-header ${passed ? 'success' : 'failed'}`}>
            <div className="result-icon">{passed ? '🏆' : '💪'}</div>
            <h1>{passed ? 'Challenge Complete!' : 'Nice Try!'}</h1>
            <p>{passed ? 'You maintained your streak!' : 'Need 80% to keep streak.'}</p>
          </div>

          <div className="score-display">
            <div className="score-circle"><span className="score-value">{percentage}%</span></div>
            <div className="score-details">
              <span>{correct}/{total} correct</span>
              {passed && results?.xpEarned && <span className="xp-earned">+{results.xpEarned} XP</span>}
            </div>
          </div>

          {passed && (
            <div className="streak-celebration">
              <span>🔥</span> <span className="streak-num">{streak + 1}</span> Day Streak!
            </div>
          )}

          <div className="card">
            <h3>Question Breakdown</h3>
            {challenge.questions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const correctIdx = q.correct ?? q.options?.findIndex(o => o.isCorrect);
              const isCorrect = userAnswer === correctIdx;
              const options = q.options?.map(o => typeof o === 'string' ? o : o.text) || [];
              
              return (
                <div key={q.id || q._id || idx} className={`q-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="q-header">
                    <span className="q-subject">{q.subject}</span>
                    <span className={`q-result ${isCorrect ? 'correct' : 'incorrect'}`}>{isCorrect ? '✓' : '✗'}</span>
                  </div>
                  <div className="q-text"><LaTeXRenderer content={q.question || q.title} /></div>
                  {!isCorrect && (
                    <div className="q-explanation">
                      <strong>Correct:</strong> {options[correctIdx]}<br/>
                      {q.explanation && <LaTeXRenderer content={q.explanation} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button className="btn btn-primary" onClick={() => navigate("/")}>Back to Home</button>
        </div>

        <style>{`
          .results-container { max-width: 700px; margin: 0 auto; }
          .results-header { text-align: center; padding: 40px; border-radius: 16px; margin-bottom: 24px; }
          .results-header.success { background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2)); }
          .results-header.failed { background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2)); }
          .result-icon { font-size: 64px; margin-bottom: 16px; }
          .score-display { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 24px; }
          .score-circle { width: 100px; height: 100px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border: 4px solid var(--primary); }
          .score-value { font-size: 28px; font-weight: 700; }
          .score-details { display: flex; flex-direction: column; gap: 4px; }
          .xp-earned { color: #22c55e; font-weight: 600; }
          .streak-celebration { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; color: white; font-weight: 600; font-size: 20px; margin-bottom: 24px; }
          .streak-num { font-size: 28px; }
          .q-item { padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid; }
          .q-item.correct { background: rgba(34, 197, 94, 0.05); border-left-color: #22c55e; }
          .q-item.incorrect { background: rgba(239, 68, 68, 0.05); border-left-color: #ef4444; }
          .q-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .q-subject { font-size: 12px; color: var(--text-secondary); }
          .q-result { font-weight: 600; }
          .q-result.correct { color: #22c55e; }
          .q-result.incorrect { color: #ef4444; }
          .q-text { font-size: 14px; margin-bottom: 8px; }
          .q-explanation { font-size: 13px; color: var(--text-secondary); padding: 12px; background: var(--bg-secondary); border-radius: 8px; }
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
