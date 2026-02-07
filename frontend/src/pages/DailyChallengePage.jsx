import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Flame, Zap, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Trophy, Sparkles, Home, BarChart3, BookOpen, Target, Timer } from "lucide-react";
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { data: challengeData, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: async () => {
      const res = await api.get('/daily-challenge/today');
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5
  });

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

  // Elapsed timer
  useEffect(() => {
    if (showResults || todayCompleted || !challenge) return;
    const tick = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    return () => clearInterval(tick);
  }, [showResults, todayCompleted, challenge]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

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
    onError: () => {
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
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const answers = {};
    challenge.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] !== undefined) answers[q.id || q._id] = selectedAnswers[idx];
    });
    submitMutation.mutate({ challengeId: challenge.id || challenge._id, answers, timeTaken });
  };

  const getScore = () => {
    if (results) return { correct: results.correct, total: results.total };
    let correct = 0;
    challenge.questions.forEach((q, idx) => {
      const userAnswer = selectedAnswers[idx];
      const correctIdx = q.correct ?? q.options?.findIndex(o => o.isCorrect);
      if (userAnswer === correctIdx) correct++;
    });
    return { correct, total: challenge.questions.length };
  };

  /* ── Login Required ── */
  if (!isAuthenticated) {
    return (
      <div className="dc-page"><div className="dc-state-card">
        <div className="dc-state-icon warn"><Zap size={48} /></div>
        <h2>Login Required</h2>
        <p>Sign in to access Daily Challenges!</p>
        <button className="dc-btn primary" onClick={() => navigate("/login")}><Zap size={18} /> Login</button>
      </div><style>{dcStyles}</style></div>
    );
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="dc-page"><div className="dc-state-card">
        <div className="dc-state-spinner" />
        <h2>Loading Challenge...</h2>
        <p>Preparing today's questions</p>
      </div><style>{dcStyles}</style></div>
    );
  }

  /* ── Error / No Challenge ── */
  if (error || !challenge) {
    return (
      <div className="dc-page"><div className="dc-state-card">
        <div className="dc-state-icon error"><XCircle size={48} /></div>
        <h2>Challenge Unavailable</h2>
        <p>No challenge available today. Check back later!</p>
        <button className="dc-btn secondary" onClick={() => navigate("/")}><Home size={18} /> Home</button>
      </div><style>{dcStyles}</style></div>
    );
  }

  /* ═══════════════════════════════════════════
     ALREADY COMPLETED TODAY
     ═══════════════════════════════════════════ */
  if (todayCompleted && !showResults) {
    return (
      <div className="dc-page">
        <div className="dc-completed">
          <div className="dc-done-hero">
            <div className="dc-done-glow" />
            <div className="dc-done-emoji">✅</div>
            <h1>Challenge Complete!</h1>
            <p>You've conquered today's challenge</p>
          </div>

          {challenge.userScore !== null && (
            <div className="dc-done-score-row">
              <div className="dc-done-ring" style={{ '--ring-color': challenge.userScore >= 80 ? '#22c55e' : '#f59e0b' }}>
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" className="dc-ring-bg" />
                  <circle cx="60" cy="60" r="52" className="dc-ring-fill" strokeDasharray={`${(challenge.userScore || 0) * 3.267} 326.7`} />
                </svg>
                <div className="dc-ring-center">
                  <span className="dc-ring-pct">{challenge.userScore}%</span>
                  <span className="dc-ring-sub">Score</span>
                </div>
              </div>
            </div>
          )}

          <div className="dc-done-streak">
            <Flame size={28} />
            <span className="dc-done-streak-num">{streak}</span>
            <span>Day Streak</span>
          </div>

          <div className="dc-done-countdown">
            <Clock size={18} />
            <span>Next challenge in </span>
            <CountdownTimer />
          </div>

          <button className="dc-btn secondary" onClick={() => navigate("/")}><Home size={18} /> Back to Home</button>
        </div>
        <style>{dcStyles}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RESULTS SCREEN
     ═══════════════════════════════════════════ */
  if (showResults) {
    const { correct, total } = getScore();
    const percentage = results?.score ?? Math.round((correct / total) * 100);
    const passed = results?.passed ?? percentage >= 80;
    const grade = percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';
    const gradeColor = { S: '#a855f7', A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }[grade];

    return (
      <div className="dc-page">
        <div className="dc-results">
          {/* Hero */}
          <div className={`dc-res-hero ${passed ? 'pass' : 'fail'}`}>
            <div className="dc-res-glow" />
            <div className="dc-res-emoji">{passed ? '🏆' : '💪'}</div>
            <h1>{passed ? 'Challenge Complete!' : 'Nice Try!'}</h1>
            <p>{passed ? 'You maintained your streak!' : 'Need 80% to keep streak.'}</p>
          </div>

          {/* Score Ring */}
          <div className="dc-res-score-row">
            <div className="dc-done-ring" style={{ '--ring-color': gradeColor }}>
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" className="dc-ring-bg" />
                <circle cx="60" cy="60" r="52" className="dc-ring-fill" strokeDasharray={`${percentage * 3.267} 326.7`} />
              </svg>
              <div className="dc-ring-center">
                <span className="dc-ring-grade" style={{ color: gradeColor }}>{grade}</span>
                <span className="dc-ring-pct">{percentage}%</span>
              </div>
            </div>
            <div className="dc-res-stats">
              <div className="dc-res-stat"><CheckCircle size={18} className="dc-green" /><span>{correct}/{total} Correct</span></div>
              <div className="dc-res-stat"><Clock size={18} /><span>{formatTime(elapsedSeconds)} Time</span></div>
              {results?.xpEarned && <div className="dc-res-stat glow-xp"><Zap size={18} /><span>+{results.xpEarned} XP</span></div>}
            </div>
          </div>

          {passed && (
            <div className="dc-res-streak">
              <Flame size={22} /> <span className="dc-res-streak-num">{streak + 1}</span> Day Streak!
            </div>
          )}

          {/* Question Breakdown */}
          <div className="dc-res-breakdown">
            <h3><BarChart3 size={18} /> Question Breakdown</h3>
            {challenge.questions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const correctIdx = q.correct ?? q.options?.findIndex(o => o.isCorrect);
              const isCorrect = userAnswer === correctIdx;
              const options = q.options?.map(o => typeof o === 'string' ? o : o.text) || [];

              return (
                <div key={q.id || q._id || idx} className={`dc-res-q ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="dc-res-q-head">
                    <div className="dc-res-q-left">
                      <span className="dc-res-q-num">Q{idx + 1}</span>
                      <span className="dc-res-q-subject">{q.subject}</span>
                    </div>
                    <span className={`dc-res-q-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? <><CheckCircle size={14} /> Correct</> : <><XCircle size={14} /> Incorrect</>}
                    </span>
                  </div>
                  <div className="dc-res-q-text"><LaTeXRenderer content={q.question || q.title} /></div>

                  <div className="dc-opts-review">
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
                          {isThisCorrect && <span className="dc-opt-tag correct-tag"><CheckCircle size={12} /> Correct</span>}
                          {isUserPick && !isCorrect && <span className="dc-opt-tag your-tag">Your answer</span>}
                          {isUserPick && isCorrect && <span className="dc-opt-tag correct-tag"><CheckCircle size={12} /> Your answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {!isCorrect && (
                    <button className="dc-ai-explain-btn" onClick={() => setShowAIExplanation({
                      question: q.question || q.title,
                      userAnswer: userAnswer !== undefined ? options[userAnswer] : 'No answer',
                      correctAnswer: options[correctIdx] || '',
                      subject: q.subject
                    })}>
                      <Sparkles size={16} /> AI Explanation
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="dc-res-actions">
            <button className="dc-btn primary" onClick={() => navigate("/")}><Home size={18} /> Home</button>
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
        <style>{dcStyles}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     ACTIVE CHALLENGE
     ═══════════════════════════════════════════ */
  const questions = challenge.questions || [];
  if (questions.length === 0) {
    return (
      <div className="dc-page"><div className="dc-state-card">
        <div className="dc-state-icon warn"><BookOpen size={48} /></div>
        <h2>No Questions</h2>
        <p>Today's challenge has no questions yet.</p>
        <button className="dc-btn secondary" onClick={() => navigate("/")}><Home size={18} /> Home</button>
      </div><style>{dcStyles}</style></div>
    );
  }

  const question = questions[currentQuestion];
  const options = question.options?.map(o => typeof o === 'string' ? o : o.text) || [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="dc-page active">
      {/* Top Bar */}
      <div className="dc-topbar">
        <div className="dc-topbar-inner">
          <div className="dc-topbar-left">
            <Zap size={20} className="dc-topbar-icon" />
            <div>
              <span className="dc-topbar-title">Daily Challenge</span>
              <span className="dc-topbar-sub">{answeredCount}/{questions.length} answered</span>
            </div>
          </div>
          <div className="dc-topbar-right">
            <div className="dc-streak-pill"><Flame size={16} /> {streak}</div>
            <div className="dc-timer"><Timer size={16} /> {formatTime(elapsedSeconds)}</div>
          </div>
        </div>
        <div className="dc-topbar-track"><div className="dc-topbar-fill" style={{ width: `${progress}%` }} /></div>
      </div>

      {/* Question Card */}
      <div className="dc-active-body">
        <div className="dc-question-card">
          <div className="dc-q-header">
            <span className="dc-q-counter">Question {currentQuestion + 1} <span>of {questions.length}</span></span>
            <span className="dc-q-subject-tag">{question.subject}</span>
          </div>

          <div className="dc-q-text">
            <LaTeXRenderer content={question.question || question.title} />
          </div>

          <div className="dc-choices">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(currentQuestion, idx)}
                className={`dc-choice ${selectedAnswers[currentQuestion] === idx ? 'selected' : ''}`}
              >
                <span className="dc-choice-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="dc-choice-text"><LaTeXRenderer content={option} /></span>
                {selectedAnswers[currentQuestion] === idx && <CheckCircle size={18} className="dc-choice-check" />}
              </button>
            ))}
          </div>

          <div className="dc-nav">
            <button className="dc-btn ghost" onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} disabled={currentQuestion === 0}>
              <ArrowLeft size={16} /> Prev
            </button>
            {currentQuestion === questions.length - 1 ? (
              <button
                className="dc-btn finish"
                onClick={handleSubmit}
                disabled={answeredCount < questions.length || submitMutation.isPending}
              >
                <Trophy size={16} /> {submitMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button className="dc-btn primary" onClick={() => setCurrentQuestion(prev => prev + 1)}>
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Question Map */}
        <div className="dc-qmap">
          <span className="dc-qmap-label">Questions</span>
          <div className="dc-qmap-grid">
            {questions.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentQuestion(idx)}
                className={`dc-qmap-dot ${idx === currentQuestion ? 'current' : ''} ${selectedAnswers[idx] !== undefined ? 'answered' : ''}`}>
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{dcStyles}</style>
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tmrw = new Date(now);
      tmrw.setDate(tmrw.getDate() + 1);
      tmrw.setHours(0, 0, 0, 0);
      const diff = tmrw - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span className="dc-countdown-val">{timeLeft}</span>;
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const dcStyles = `
  .dc-page { min-height: calc(100vh - 64px); padding: 24px 16px 120px; }
  .dc-page.active { padding: 0 0 120px; }

  /* State Cards */
  .dc-state-card {
    max-width: 440px; margin: 80px auto 0; text-align: center;
    background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 20px;
    padding: 48px 32px;
  }
  .dc-state-card h2 { margin: 16px 0 8px; font-size: 1.5rem; }
  .dc-state-card p { color: var(--text-secondary); margin-bottom: 24px; }
  .dc-state-spinner { width: 48px; height: 48px; border: 3px solid var(--border-color); border-top-color: #f97316; border-radius: 50%; animation: dcSpin .8s linear infinite; margin: 0 auto 16px; }
  @keyframes dcSpin { to { transform: rotate(360deg); } }
  .dc-state-icon { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
  .dc-state-icon.warn { background: rgba(251,191,36,.12); color: #f59e0b; }
  .dc-state-icon.error { background: rgba(239,68,68,.12); color: #ef4444; }

  /* Buttons */
  .dc-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
    border-radius: 12px; font-weight: 600; font-size: .9rem; cursor: pointer; transition: all .2s;
    border: 1px solid transparent;
  }
  .dc-btn.primary { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; }
  .dc-btn.primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .dc-btn.secondary { background: var(--bg-secondary); border-color: var(--border-color); color: var(--text-primary); }
  .dc-btn.secondary:hover { border-color: #f97316; }
  .dc-btn.ghost { background: transparent; color: var(--text-secondary); }
  .dc-btn.ghost:hover { color: var(--text-primary); background: var(--bg-secondary); }
  .dc-btn.finish { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
  .dc-btn.finish:hover { filter: brightness(1.1); }
  .dc-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* ── COMPLETED ── */
  .dc-completed { max-width: 480px; margin: 0 auto; text-align: center; }
  .dc-done-hero {
    position: relative; padding: 48px 24px 32px;
    background: linear-gradient(135deg, rgba(34,197,94,.1), rgba(16,185,129,.06));
    border: 1px solid rgba(34,197,94,.2); border-radius: 24px; margin-bottom: 24px; overflow: hidden;
  }
  .dc-done-glow {
    position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,197,94,.15), transparent 70%); pointer-events: none;
  }
  .dc-done-emoji { font-size: 64px; position: relative; margin-bottom: 12px; }
  .dc-done-hero h1 { position: relative; margin: 0 0 4px; }
  .dc-done-hero p { position: relative; color: var(--text-secondary); margin: 0; }

  .dc-done-score-row {
    display: flex; justify-content: center; margin-bottom: 24px;
    padding: 28px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 20px;
  }
  .dc-done-ring { position: relative; width: 120px; height: 120px; }
  .dc-done-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .dc-ring-bg { fill: none; stroke: var(--bg-tertiary); stroke-width: 8; }
  .dc-ring-fill { fill: none; stroke: var(--ring-color); stroke-width: 8; stroke-linecap: round; transition: stroke-dasharray .8s ease; }
  .dc-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .dc-ring-grade { font-size: 2rem; font-weight: 800; line-height: 1; }
  .dc-ring-pct { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); }
  .dc-ring-sub { font-size: .75rem; color: var(--text-secondary); }

  .dc-done-streak {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 20px; background: linear-gradient(135deg, rgba(249,115,22,.12), rgba(234,88,12,.08));
    border: 1px solid rgba(249,115,22,.25); border-radius: 16px; margin-bottom: 20px;
    color: #f97316; font-weight: 600; font-size: 1.1rem;
  }
  .dc-done-streak-num { font-size: 2rem; font-weight: 800; }

  .dc-done-countdown {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 16px; background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 12px; margin-bottom: 24px; color: var(--text-secondary);
  }
  .dc-countdown-val { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 1.1rem; color: #f97316; }

  /* ── ACTIVE CHALLENGE ── */
  .dc-topbar {
    position: sticky; top: 64px; z-index: 100;
    background: var(--bg-primary); border-bottom: 1px solid var(--border-color);
    padding: 12px 24px 0;
  }
  .dc-topbar-inner { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .dc-topbar-left { display: flex; align-items: center; gap: 10px; }
  .dc-topbar-icon { color: #f97316; }
  .dc-topbar-title { font-weight: 700; font-size: .95rem; display: block; }
  .dc-topbar-sub { font-size: .75rem; color: var(--text-secondary); }
  .dc-topbar-right { display: flex; align-items: center; gap: 10px; }
  .dc-streak-pill {
    display: flex; align-items: center; gap: 4px; padding: 6px 12px;
    background: rgba(249,115,22,.12); border-radius: 8px; font-weight: 700;
    font-size: .85rem; color: #f97316;
  }
  .dc-timer {
    display: flex; align-items: center; gap: 6px;
    font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: .9rem;
    padding: 6px 12px; border-radius: 8px; background: var(--bg-secondary); color: var(--text-secondary);
  }
  .dc-topbar-track { height: 3px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden; }
  .dc-topbar-fill { height: 100%; background: linear-gradient(90deg, #f97316, #ea580c); transition: width .3s; }

  .dc-active-body { max-width: 800px; margin: 24px auto 0; padding: 0 20px; }

  .dc-question-card {
    background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 20px; padding: 32px; margin-bottom: 16px;
  }
  .dc-q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .dc-q-counter { font-size: .9rem; font-weight: 600; color: var(--text-secondary); }
  .dc-q-counter span { font-weight: 400; }
  .dc-q-subject-tag { padding: 5px 14px; border-radius: 20px; font-size: .75rem; font-weight: 600; background: rgba(249,115,22,.12); color: #f97316; }
  .dc-q-text { font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 28px; }

  .dc-choices { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
  .dc-choice {
    display: flex; align-items: center; gap: 14px; padding: 16px 20px;
    background: var(--bg-secondary); border: 2px solid var(--border-color);
    border-radius: 14px; cursor: pointer; transition: all .2s; text-align: left;
  }
  .dc-choice:hover { border-color: #f97316; background: var(--bg-tertiary); transform: translateX(4px); }
  .dc-choice.selected { border-color: #f97316; background: rgba(249,115,22,.08); }
  .dc-choice-letter {
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    background: var(--bg-tertiary); border-radius: 10px; font-weight: 700; flex-shrink: 0; transition: all .2s;
  }
  .dc-choice.selected .dc-choice-letter { background: #f97316; color: #fff; }
  .dc-choice-text { flex: 1; color: var(--text-primary); }
  .dc-choice-check { color: #f97316; flex-shrink: 0; }

  .dc-nav { display: flex; justify-content: space-between; gap: 12px; }

  .dc-qmap {
    background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 16px; padding: 16px 20px;
  }
  .dc-qmap-label { font-size: .75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 10px; }
  .dc-qmap-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .dc-qmap-dot {
    width: 36px; height: 36px; border-radius: 10px; font-size: .85rem; font-weight: 600;
    background: var(--bg-secondary); border: 1.5px solid var(--border-color);
    cursor: pointer; transition: all .15s; color: var(--text-secondary);
  }
  .dc-qmap-dot:hover { border-color: #f97316; }
  .dc-qmap-dot.current { background: #f97316; border-color: #f97316; color: #fff; }
  .dc-qmap-dot.answered { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.4); color: #22c55e; }
  .dc-qmap-dot.current.answered { background: #f97316; color: #fff; }

  /* ── RESULTS ── */
  .dc-results { max-width: 780px; margin: 0 auto; }
  .dc-res-hero {
    position: relative; text-align: center; padding: 48px 24px 36px;
    border-radius: 24px; margin-bottom: 24px; overflow: hidden;
  }
  .dc-res-hero.pass { background: linear-gradient(135deg, rgba(34,197,94,.12), rgba(16,185,129,.08)); border: 1px solid rgba(34,197,94,.2); }
  .dc-res-hero.fail { background: linear-gradient(135deg, rgba(249,115,22,.12), rgba(234,88,12,.08)); border: 1px solid rgba(249,115,22,.2); }
  .dc-res-glow { position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 200px; height: 200px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.06), transparent 70%); }
  .dc-res-emoji { font-size: 64px; margin-bottom: 12px; position: relative; }
  .dc-res-hero h1 { margin: 0 0 4px; position: relative; }
  .dc-res-hero p { margin: 0; color: var(--text-secondary); position: relative; }

  .dc-res-score-row {
    display: flex; align-items: center; justify-content: center; gap: 40px;
    padding: 32px; background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 20px; margin-bottom: 24px;
  }
  .dc-res-stats { display: flex; flex-direction: column; gap: 12px; }
  .dc-res-stat { display: flex; align-items: center; gap: 10px; font-weight: 500; color: var(--text-secondary); }
  .dc-res-stat.glow-xp { color: #22c55e; font-weight: 700; }
  .dc-green { color: #22c55e; }

  .dc-res-streak {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 16px; background: linear-gradient(135deg, #f97316, #ea580c);
    border-radius: 14px; color: #fff; font-weight: 700; font-size: 1.15rem; margin-bottom: 24px;
  }
  .dc-res-streak-num { font-size: 1.6rem; }

  .dc-res-breakdown {
    background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 20px; padding: 28px; margin-bottom: 24px;
  }
  .dc-res-breakdown h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 20px; font-size: 1.05rem; }

  .dc-res-q { padding: 20px; border-radius: 14px; margin-bottom: 12px; border-left: 4px solid; }
  .dc-res-q.correct { background: rgba(34,197,94,.04); border-left-color: #22c55e; }
  .dc-res-q.incorrect { background: rgba(239,68,68,.04); border-left-color: #ef4444; }
  .dc-res-q-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
  .dc-res-q-left { display: flex; align-items: center; gap: 10px; }
  .dc-res-q-num { font-weight: 700; font-size: .85rem; color: var(--text-secondary); }
  .dc-res-q-subject { font-size: .7rem; padding: 3px 10px; background: var(--bg-tertiary); border-radius: 20px; color: var(--text-secondary); }
  .dc-res-q-badge { display: inline-flex; align-items: center; gap: 4px; font-size: .8rem; font-weight: 600; padding: 4px 12px; border-radius: 8px; }
  .dc-res-q-badge.correct { background: rgba(34,197,94,.12); color: #22c55e; }
  .dc-res-q-badge.incorrect { background: rgba(239,68,68,.12); color: #ef4444; }
  .dc-res-q-text { font-size: .95rem; line-height: 1.6; margin-bottom: 12px; }

  .dc-opts-review { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
  .dc-opt-review {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px;
    border-radius: 10px; border: 1.5px solid var(--border-color); background: var(--bg-secondary);
  }
  .dc-opt-review.correct-opt { border-color: #22c55e; background: rgba(34,197,94,.08); }
  .dc-opt-review.wrong-opt { border-color: #ef4444; background: rgba(239,68,68,.08); }
  .dc-opt-letter {
    width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
    background: var(--bg-tertiary); border-radius: 6px; font-weight: 600; font-size: .85rem; flex-shrink: 0;
  }
  .correct-opt .dc-opt-letter { background: #22c55e; color: #fff; }
  .wrong-opt .dc-opt-letter { background: #ef4444; color: #fff; }
  .dc-opt-text { flex: 1; font-size: .9rem; }
  .dc-opt-tag { display: inline-flex; align-items: center; gap: 3px; font-size: .7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; flex-shrink: 0; }
  .correct-tag { background: rgba(34,197,94,.15); color: #22c55e; }
  .your-tag { background: rgba(239,68,68,.15); color: #ef4444; }

  .dc-ai-explain-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
    border-radius: 8px; background: linear-gradient(135deg, rgba(249,115,22,.1), rgba(234,88,12,.1));
    border: 1px solid rgba(249,115,22,.25); color: #f97316; font-weight: 600;
    font-size: .8rem; cursor: pointer; margin-top: 8px; transition: all .2s;
  }
  .dc-ai-explain-btn:hover { background: linear-gradient(135deg, rgba(249,115,22,.18), rgba(234,88,12,.18)); }

  .dc-res-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* Responsive */
  @media (max-width: 600px) {
    .dc-res-score-row { flex-direction: column; gap: 20px; }
    .dc-question-card { padding: 20px; }
    .dc-topbar { padding: 10px 16px 0; }
    .dc-active-body { padding: 0 12px; }
    .dc-topbar-right { gap: 6px; }
    .dc-streak-pill, .dc-timer { padding: 4px 8px; font-size: .8rem; }
  }
`;
