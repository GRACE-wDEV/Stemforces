import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Timer, Zap, Brain, Trophy, ArrowLeft, ArrowRight, CheckCircle, XCircle, Sparkles, Target, Clock, BarChart3, RotateCcw, Home, Eye, BookOpen } from 'lucide-react';
import LaTeXRenderer from '../components/common/LaTeXRenderer';
import ConfirmModal from '../components/common/ConfirmModal';
import AIHintButton from '../components/ai/AIHintButton';
import AIExplanation from '../components/ai/AIExplanation';
import api from '../api/axios';
import { useToast } from '../stores/toastStore';

const QuizPage = () => {
  const { subjectId, topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const { subjectName, topicName, difficulty, estimatedTime } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((estimatedTime || 30) * 60);
  const [showResults, setShowResults] = useState(false);
  const [customTime, setCustomTime] = useState(estimatedTime || 30);
  const [useTimer, setUseTimer] = useState(true);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [showAIExplanation, setShowAIExplanation] = useState(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const { data: userStats } = useQuery({
    queryKey: ['user-stats-quiz-check'],
    queryFn: async () => {
      const res = await api.get('/auth/me/stats');
      return res.data.data;
    },
    staleTime: 1000 * 60
  });

  const { data: quizApiData, isLoading, error } = useQuery({
    queryKey: ['quiz-data', subjectId, topicId],
    queryFn: async () => {
      const isObjectId = (id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
      if (isObjectId(topicId)) {
        try {
          const response = await fetch(`/api/quizzes/${topicId}`);
          if (response.ok) {
            const result = await response.json();
            return result.data;
          }
        } catch (e) {
          console.debug('Quiz not found by ID, falling back', e?.message);
        }
      }
      const response = await fetch(`/api/home/quiz/${subjectId}/${encodeURIComponent(topicId)}`);
      if (!response.ok) throw new Error('Failed to fetch quiz data');
      const result = await response.json();
      return result.data;
    },
    enabled: !!subjectId && !!topicId
  });

  useEffect(() => {
    if (userStats?.completedQuizIds && quizApiData?._id) {
      const isCompleted = userStats.completedQuizIds.includes(quizApiData._id.toString());
      if (isCompleted) setAlreadyCompleted(true);
    }
  }, [userStats, quizApiData]);

  const quizData = useMemo(() => quizApiData || {
    id: `${subjectId}-${topicId}`,
    title: topicName || 'Quiz',
    subject: subjectName || 'Subject',
    difficulty: difficulty || 'Medium',
    questions: []
  }, [quizApiData, subjectId, topicId, topicName, subjectName, difficulty]);

  const isArabic = (quizData.subject || '').toLowerCase() === 'arabic';

  /* ── Submit Logic ── */
  const handleFinishQuiz = useCallback(async () => {
    setSubmittingQuiz(true);
    setTimerStarted(false);
    try {
      const answers = {};
      quizData.questions.forEach(question => {
        const selectedChoice = selectedAnswers[question.id];
        if (selectedChoice && question.choices) {
          const choice = question.choices.find(c => c.id === selectedChoice);
          if (choice) answers[question._id || question.id] = choice.text;
        }
      });
      let timeTaken;
      if (useTimer) {
        timeTaken = (customTime * 60 - timeLeft) / 60;
      } else {
        const end = Date.now();
        timeTaken = ((end - (startTimestamp || end)) / 1000) / 60;
      }
      if (quizData._id) {
        try {
          const response = await api.post(`/quizzes/${quizData._id}/submit`, { answers, timeTaken });
          if (response.data?.success) {
            setQuizResults(response.data.data);
            const score = response.data.data.score;
            const xpEarned = response.data.data.progressUpdate?.xpEarned || 0;
            if (score >= 80) success(`🎉 Great job! ${score}% score, +${xpEarned} XP earned!`);
            else if (score >= 60) success(`👍 Good effort! ${score}% score, +${xpEarned} XP earned`);
            else success(`Quiz completed! ${score}% score, +${xpEarned} XP earned`);
          }
        } catch (submitError) {
          console.error('Error submitting quiz:', submitError);
          if (submitError.response?.data?.message?.includes('already completed')) {
            showError('You have already completed this quiz');
          }
        }
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      showError('Failed to submit quiz. Your progress may not be saved.');
    } finally {
      setSubmittingQuiz(false);
      setShowResults(true);
    }
  }, [quizData, selectedAnswers, customTime, timeLeft, useTimer, startTimestamp, success, showError]);

  /* ── Timer ── */
  useEffect(() => {
    if (!timerStarted || showResults || !useTimer || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setTimeout(() => handleFinishQuiz(), 100); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerStarted, showResults, timeLeft, handleFinishQuiz, useTimer]);

  useEffect(() => {
    if (!timerStarted || showResults || useTimer) return;
    setElapsedSeconds(0);
    const tick = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    return () => clearInterval(tick);
  }, [timerStarted, showResults, useTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, choiceId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  const startQuiz = () => {
    setShowResults(false);
    setStartTimestamp(Date.now());
    setElapsedSeconds(0);
    if (useTimer) setTimeLeft(customTime * 60);
    else setTimeLeft(0);
    setTimerStarted(true);
  };

  const calculateResults = () => {
    if (quizResults) {
      return {
        correct: quizResults.questionsCorrect,
        total: quizResults.questionsTotal,
        percentage: quizResults.score,
        timeUsed: quizResults.timeTaken * 60,
        xpEarned: quizResults.progressUpdate?.xpEarned || 0
      };
    }
    let correct = 0;
    quizData.questions.forEach(question => {
      const selectedChoice = selectedAnswers[question.id];
      if (selectedChoice) {
        const choice = question.choices.find(c => c.id === selectedChoice);
        if (choice && choice.isCorrect) correct++;
      }
    });
    const timeUsed = useTimer ? (customTime * 60) - timeLeft : (elapsedSeconds || Math.max(0, Math.floor(((Date.now() - (startTimestamp || Date.now())) / 1000))));
    return {
      correct,
      total: quizData.questions.length,
      percentage: Math.round((correct / quizData.questions.length) * 100),
      timeUsed,
      xpEarned: correct * 10
    };
  };

  const getDiffBadge = (diff) => {
    const d = (diff || '').toLowerCase();
    if (d === 'easy') return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Easy' };
    if (d === 'hard') return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Hard' };
    return { bg: 'rgba(251,191,36,0.15)', color: '#f59e0b', label: 'Medium' };
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="qp-page">
        <div className="qp-state-card">
          <div className="qp-state-spinner" />
          <h2>Loading Quiz...</h2>
          <p>Preparing your challenge</p>
        </div>
        <style>{qpStyles}</style>
      </div>
    );
  }

  /* ── Already Completed ── */
  if (alreadyCompleted && quizData?._id) {
    return (
      <div className="qp-page">
        <div className="qp-state-card">
          <div className="qp-state-icon done"><CheckCircle size={48} /></div>
          <h2>Already Completed</h2>
          <p>You've taken this quiz. Each quiz can only be taken once.</p>
          <div className="qp-state-actions">
            <button className="qp-btn secondary" onClick={() => navigate('/browse')}><BookOpen size={18} /> Browse More</button>
            <button className="qp-btn primary" onClick={() => navigate(`/quiz/${quizData._id}/review`)}><Eye size={18} /> Review Answers</button>
          </div>
        </div>
        <style>{qpStyles}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="qp-page">
        <div className="qp-state-card">
          <div className="qp-state-icon error"><XCircle size={48} /></div>
          <h2>Failed to Load</h2>
          <p>{error.message}</p>
          <div className="qp-state-actions">
            <button className="qp-btn secondary" onClick={() => navigate('/')}><Home size={18} /> Home</button>
            <button className="qp-btn primary" onClick={() => window.location.reload()}><RotateCcw size={18} /> Retry</button>
          </div>
        </div>
        <style>{qpStyles}</style>
      </div>
    );
  }

  /* ── No Questions ── */
  if (quizData.questions.length === 0) {
    return (
      <div className="qp-page">
        <div className="qp-state-card">
          <div className="qp-state-icon warn"><Brain size={48} /></div>
          <h2>No Questions</h2>
          <p>This quiz doesn't have any questions yet.</p>
          <button className="qp-btn primary" onClick={() => navigate('/')}><Home size={18} /> Home</button>
        </div>
        <style>{qpStyles}</style>
      </div>
    );
  }

  const diffBadge = getDiffBadge(quizData.difficulty);

  /* ═══════════════════════════════════════════
     START SCREEN
     ═══════════════════════════════════════════ */
  if (!timerStarted && !showResults) {
    return (
      <div className={`qp-page ${isArabic ? 'qp-rtl' : ''}`}>
        <div className="qp-start">
          {/* Hero */}
          <div className="qp-start-hero">
            <div className="qp-start-glow" />
            <div className="qp-start-icon"><Target size={40} /></div>
            <h1>{quizData.title}</h1>
            <div className="qp-start-meta">
              <span className="qp-chip subject">{quizData.subject}</span>
              <span className="qp-chip diff" style={{ background: diffBadge.bg, color: diffBadge.color }}>{diffBadge.label}</span>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="qp-start-stats">
            <div className="qp-start-stat">
              <Brain size={20} />
              <span className="qp-stat-val">{quizData.questions.length}</span>
              <span className="qp-stat-lbl">Questions</span>
            </div>
            <div className="qp-start-stat">
              <Clock size={20} />
              <span className="qp-stat-val">{customTime}m</span>
              <span className="qp-stat-lbl">Time Limit</span>
            </div>
            <div className="qp-start-stat">
              <Zap size={20} />
              <span className="qp-stat-val">+{quizData.questions.length * 10}</span>
              <span className="qp-stat-lbl">Max XP</span>
            </div>
            <div className="qp-start-stat">
              <Sparkles size={20} />
              <span className="qp-stat-val">&infin;</span>
              <span className="qp-stat-lbl">AI Hints</span>
            </div>
          </div>

          {/* Timer Config */}
          <div className="qp-start-config">
            <div className="qp-config-row">
              <label className="qp-toggle">
                <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} />
                <span className="qp-toggle-track"><span className="qp-toggle-thumb" /></span>
                <span>{useTimer ? 'Timer On' : 'No Timer (Practice)'}</span>
              </label>
            </div>
            {useTimer && (
              <div className="qp-time-presets">
                {[10, 15, 20, 30, 45, 60].map((t) => (
                  <button key={t} onClick={() => setCustomTime(t)} className={`qp-preset ${customTime === t ? 'active' : ''}`}>
                    {t}m
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Banner */}
          <div className="qp-ai-banner">
            <div className="qp-ai-icon"><Sparkles size={22} /></div>
            <div>
              <strong>AI Tutor Ready</strong>
              <p>Stuck? Get hints and explanations powered by AI</p>
            </div>
          </div>

          {/* Actions */}
          <div className="qp-start-actions">
            <button className="qp-btn primary glow large" onClick={startQuiz}>
              <Zap size={20} /> Start Quiz
            </button>
            <button className="qp-btn ghost" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Go Back
            </button>
          </div>
        </div>
        <style>{qpStyles}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RESULTS SCREEN
     ═══════════════════════════════════════════ */
  if (showResults) {
    const results = calculateResults();
    const grade = results.percentage >= 90 ? 'S' : results.percentage >= 80 ? 'A' : results.percentage >= 70 ? 'B' : results.percentage >= 60 ? 'C' : results.percentage >= 50 ? 'D' : 'F';
    const gradeColor = { S: '#a855f7', A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }[grade];
    const message = results.percentage >= 90 ? 'Outstanding!' : results.percentage >= 70 ? 'Great Job!' : results.percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!';

    return (
      <div className={`qp-page ${isArabic ? 'qp-rtl' : ''}`}>
        <div className="qp-results">
          {/* Hero */}
          <div className={`qp-res-hero ${results.percentage >= 70 ? 'pass' : 'fail'}`}>
            <div className="qp-res-glow" />
            <div className="qp-res-emoji">{results.percentage >= 90 ? '🏆' : results.percentage >= 70 ? '🎉' : results.percentage >= 50 ? '👍' : '💪'}</div>
            <h1>{message}</h1>
            <p>{quizData.title}</p>
          </div>

          {/* Score Ring + Stats */}
          <div className="qp-res-score-row">
            <div className="qp-res-ring" style={{ '--ring-color': gradeColor }}>
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" className="qp-ring-bg" />
                <circle cx="60" cy="60" r="52" className="qp-ring-fill" strokeDasharray={`${results.percentage * 3.267} 326.7`} />
              </svg>
              <div className="qp-ring-center">
                <span className="qp-ring-grade" style={{ color: gradeColor }}>{grade}</span>
                <span className="qp-ring-pct">{results.percentage}%</span>
              </div>
            </div>
            <div className="qp-res-stats">
              <div className="qp-res-stat"><CheckCircle size={18} className="qp-green" /><span>{results.correct}/{results.total} Correct</span></div>
              <div className="qp-res-stat"><Clock size={18} /><span>{formatTime(results.timeUsed)} Time</span></div>
              <div className="qp-res-stat glow-xp"><Zap size={18} /><span>+{results.xpEarned} XP</span></div>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="qp-res-breakdown">
            <h3><BarChart3 size={18} /> Question Breakdown</h3>
            {quizData.questions.map((question, index) => {
              const selectedChoice = selectedAnswers[question.id];
              const userChoice = question.choices.find(c => c.id === selectedChoice);
              const correctChoice = question.choices.find(c => c.isCorrect);
              const isCorrect = userChoice && userChoice.isCorrect;

              return (
                <div key={question.id} className={`qp-res-q ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="qp-res-q-head">
                    <span className="qp-res-q-num">Q{index + 1}</span>
                    <span className={`qp-res-q-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? <><CheckCircle size={14} /> Correct</> : <><XCircle size={14} /> Incorrect</>}
                    </span>
                  </div>
                  <div className="qp-res-q-text"><LaTeXRenderer content={question.question} /></div>
                  {question.image_url && <img src={question.image_url} alt="" className="qp-res-q-img" />}

                  {!isCorrect && (
                    <div className="qp-res-q-compare">
                      <div className="qp-res-ans wrong">
                        <span className="qp-res-ans-label">Your answer</span>
                        <span>{userChoice ? <LaTeXRenderer content={userChoice.text} /> : 'No answer'}</span>
                      </div>
                      <div className="qp-res-ans right">
                        <span className="qp-res-ans-label">Correct</span>
                        <span><LaTeXRenderer content={correctChoice?.text || ''} /></span>
                      </div>
                      <button className="qp-ai-explain-btn" onClick={() => setShowAIExplanation({
                        question: question.question,
                        userAnswer: userChoice?.text || 'No answer',
                        correctAnswer: correctChoice?.text || '',
                        subject: quizData.subject
                      })}>
                        <Sparkles size={16} /> AI Explanation
                      </button>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="qp-res-q-explanation">
                      <BookOpen size={14} /> <LaTeXRenderer content={question.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="qp-res-actions">
            <button className="qp-btn primary" onClick={() => window.location.reload()}><RotateCcw size={18} /> Retake</button>
            <button className="qp-btn secondary" onClick={() => navigate('/browse')}><BookOpen size={18} /> Browse</button>
            <button className="qp-btn ghost" onClick={() => navigate('/')}><Home size={18} /> Home</button>
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
        <style>{qpStyles}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     ACTIVE QUIZ
     ═══════════════════════════════════════════ */
  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className={`qp-page active ${isArabic ? 'qp-rtl' : ''}`}>
      {/* Top Bar */}
      <div className="qp-topbar">
        <div className="qp-topbar-inner">
          <div className="qp-topbar-left">
            <span className="qp-topbar-title">{quizData.title}</span>
            <span className="qp-topbar-progress">{answeredCount}/{quizData.questions.length} answered</span>
          </div>
          <div className={`qp-timer ${useTimer ? (timeLeft < 60 ? 'urgent' : timeLeft < 300 ? 'warn' : '') : 'relaxed'}`}>
            <Timer size={16} />
            {useTimer ? formatTime(timeLeft) : formatTime(elapsedSeconds)}
          </div>
        </div>
        <div className="qp-topbar-track"><div className="qp-topbar-fill" style={{ width: `${progress}%` }} /></div>
      </div>

      {/* Main Content */}
      <div className="qp-active-body">
        <div className="qp-question-card">
          <div className="qp-q-header">
            <span className="qp-q-counter">Question {currentQuestion + 1} <span>of {quizData.questions.length}</span></span>
            <AIHintButton
              key={question.id}
              question={question.question}
              options={question.choices.map(c => c.text)}
              subject={quizData.subject}
              disabled={!!selectedAnswers[question.id]}
              staticHint={question.hint}
            />
          </div>

          <div className="qp-q-text">
            <LaTeXRenderer content={question.question} />
            {question.image_url && <img src={question.image_url} alt="" className="qp-q-img" />}
          </div>

          <div className="qp-choices">
            {question.choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleAnswerSelect(question.id, choice.id)}
                className={`qp-choice ${selectedAnswers[question.id] === choice.id ? 'selected' : ''}`}
              >
                <span className="qp-choice-letter">{String.fromCharCode(65 + index)}</span>
                <span className="qp-choice-text"><LaTeXRenderer content={choice.text} /></span>
                {selectedAnswers[question.id] === choice.id && <CheckCircle size={18} className="qp-choice-check" />}
              </button>
            ))}
          </div>

          <div className="qp-nav">
            <button className="qp-btn ghost" onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} disabled={currentQuestion === 0}>
              <ArrowLeft size={16} /> Prev
            </button>
            {currentQuestion === quizData.questions.length - 1 ? (
              <button className="qp-btn finish" onClick={() => setShowConfirmSubmit(true)} disabled={submittingQuiz}>
                <Trophy size={16} /> {submittingQuiz ? 'Submitting...' : 'Finish Quiz'}
              </button>
            ) : (
              <button className="qp-btn primary" onClick={() => setCurrentQuestion(prev => Math.min(quizData.questions.length - 1, prev + 1))}>
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>

          <ConfirmModal
            isOpen={showConfirmSubmit}
            title="Submit Quiz?"
            message={(() => {
              const unanswered = quizData.questions.length - answeredCount;
              if (unanswered > 0) return `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`;
              return "You've answered all questions. Ready to submit?";
            })()}
            confirmText="Submit Quiz"
            cancelText="Review Answers"
            type={answeredCount < quizData.questions.length ? 'warning' : 'success'}
            onConfirm={() => { setShowConfirmSubmit(false); handleFinishQuiz(); }}
            onCancel={() => setShowConfirmSubmit(false)}
          />
        </div>

        {/* Question Map */}
        <div className="qp-qmap">
          <span className="qp-qmap-label">Questions</span>
          <div className="qp-qmap-grid">
            {quizData.questions.map((q, idx) => (
              <button key={q.id} onClick={() => setCurrentQuestion(idx)}
                className={`qp-qmap-dot ${idx === currentQuestion ? 'current' : ''} ${selectedAnswers[q.id] ? 'answered' : ''}`}>
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{qpStyles}</style>
    </div>
  );
};

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const qpStyles = `
  .qp-page { min-height: calc(100vh - 64px); padding: 24px 16px 120px; }
  .qp-page.active { padding: 0 0 120px; }

  /* State Cards */
  .qp-state-card {
    max-width: 440px; margin: 80px auto 0; text-align: center;
    background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 20px;
    padding: 48px 32px;
  }
  .qp-state-card h2 { margin: 16px 0 8px; font-size: 1.5rem; }
  .qp-state-card p { color: var(--text-secondary); margin-bottom: 24px; }
  .qp-state-spinner { width: 48px; height: 48px; border: 3px solid var(--border-color); border-top-color: var(--primary); border-radius: 50%; animation: qpSpin .8s linear infinite; margin: 0 auto 16px; }
  @keyframes qpSpin { to { transform: rotate(360deg); } }
  .qp-state-icon { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
  .qp-state-icon.done { background: rgba(34,197,94,.12); color: #22c55e; }
  .qp-state-icon.error { background: rgba(239,68,68,.12); color: #ef4444; }
  .qp-state-icon.warn { background: rgba(251,191,36,.12); color: #f59e0b; }
  .qp-state-actions { display: flex; gap: 12px; justify-content: center; }

  /* Buttons */
  .qp-btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
    border-radius: 12px; font-weight: 600; font-size: .9rem; cursor: pointer; transition: all .2s;
    border: 1px solid transparent;
  }
  .qp-btn.primary { background: var(--primary); color: #fff; }
  .qp-btn.primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .qp-btn.primary.glow { box-shadow: 0 0 24px rgba(99,102,241,.35); }
  .qp-btn.primary.large { padding: 16px 40px; font-size: 1.05rem; }
  .qp-btn.secondary { background: var(--bg-secondary); border-color: var(--border-color); color: var(--text-primary); }
  .qp-btn.secondary:hover { border-color: var(--primary); }
  .qp-btn.ghost { background: transparent; color: var(--text-secondary); }
  .qp-btn.ghost:hover { color: var(--text-primary); background: var(--bg-secondary); }
  .qp-btn.finish { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
  .qp-btn.finish:hover { filter: brightness(1.1); }
  .qp-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* START SCREEN */
  .qp-start { max-width: 520px; margin: 0 auto; }
  .qp-start-hero {
    position: relative; text-align: center; padding: 48px 24px 32px;
    background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 24px; margin-bottom: 20px; overflow: hidden;
  }
  .qp-start-glow {
    position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,.2), transparent 70%);
    pointer-events: none;
  }
  .qp-start-icon {
    width: 72px; height: 72px; border-radius: 20px;
    background: linear-gradient(135deg, var(--primary), #a855f7);
    display: flex; align-items: center; justify-content: center;
    color: #fff; margin: 0 auto 16px; position: relative;
  }
  .qp-start-hero h1 { font-size: 1.6rem; margin: 0 0 12px; position: relative; }
  .qp-start-meta { display: flex; gap: 8px; justify-content: center; position: relative; }
  .qp-chip { padding: 5px 14px; border-radius: 20px; font-size: .8rem; font-weight: 600; }
  .qp-chip.subject { background: rgba(99,102,241,.12); color: var(--primary); }

  .qp-start-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
  .qp-start-stat {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 16px 8px; background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 16px; color: var(--text-secondary);
  }
  .qp-stat-val { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }
  .qp-stat-lbl { font-size: .7rem; text-transform: uppercase; letter-spacing: .5px; }

  .qp-start-config {
    padding: 20px; background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 16px; margin-bottom: 16px;
  }
  .qp-config-row { display: flex; justify-content: center; margin-bottom: 12px; }
  .qp-toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 500; font-size: .9rem; }
  .qp-toggle input { display: none; }
  .qp-toggle-track {
    width: 44px; height: 24px; background: var(--bg-tertiary); border-radius: 12px;
    position: relative; transition: background .2s;
  }
  .qp-toggle input:checked + .qp-toggle-track { background: var(--primary); }
  .qp-toggle-thumb {
    position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
    background: #fff; border-radius: 50%; transition: transform .2s;
  }
  .qp-toggle input:checked + .qp-toggle-track .qp-toggle-thumb { transform: translateX(20px); }

  .qp-time-presets { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .qp-preset {
    padding: 8px 16px; border-radius: 10px; background: var(--bg-secondary);
    border: 1.5px solid var(--border-color); font-weight: 600; cursor: pointer; transition: all .2s; color: var(--text-primary);
  }
  .qp-preset:hover { border-color: var(--primary); }
  .qp-preset.active { background: var(--primary); border-color: var(--primary); color: #fff; }

  .qp-ai-banner {
    display: flex; align-items: center; gap: 14px; padding: 16px 20px;
    background: linear-gradient(135deg, rgba(99,102,241,.08), rgba(168,85,247,.08));
    border: 1px solid rgba(99,102,241,.25); border-radius: 16px; margin-bottom: 20px;
  }
  .qp-ai-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, var(--primary), #a855f7); color: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .qp-ai-banner strong { color: var(--text-primary); }
  .qp-ai-banner p { margin: 2px 0 0; font-size: .8rem; color: var(--text-secondary); }
  .qp-start-actions { display: flex; flex-direction: column; gap: 10px; align-items: center; }

  /* ACTIVE QUIZ */
  .qp-topbar {
    position: sticky; top: 64px; z-index: 100;
    background: var(--bg-primary); border-bottom: 1px solid var(--border-color);
    padding: 12px 24px 0;
  }
  .qp-topbar-inner { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .qp-topbar-left { display: flex; flex-direction: column; }
  .qp-topbar-title { font-weight: 700; font-size: .95rem; }
  .qp-topbar-progress { font-size: .75rem; color: var(--text-secondary); }
  .qp-timer {
    display: flex; align-items: center; gap: 6px;
    font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 1rem;
    padding: 8px 16px; border-radius: 10px; background: var(--bg-secondary);
  }
  .qp-timer.warn { background: rgba(251,191,36,.15); color: #f59e0b; }
  .qp-timer.urgent { background: rgba(239,68,68,.15); color: #ef4444; animation: qpPulse 1s infinite; }
  .qp-timer.relaxed { color: var(--text-secondary); }
  @keyframes qpPulse { 0%,100% { opacity:1; } 50% { opacity:.6; } }

  .qp-topbar-track { height: 3px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden; }
  .qp-topbar-fill { height: 100%; background: linear-gradient(90deg, var(--primary), #a855f7); transition: width .3s; }

  .qp-active-body { max-width: 800px; margin: 24px auto 0; padding: 0 20px; }

  .qp-question-card {
    background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 20px; padding: 32px; margin-bottom: 16px;
  }
  .qp-q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .qp-q-counter { font-size: .9rem; font-weight: 600; color: var(--text-secondary); }
  .qp-q-counter span { font-weight: 400; }
  .qp-q-text { font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 28px; }
  .qp-q-img { max-width: 100%; max-height: 400px; object-fit: contain; margin: 16px auto; display: block; border-radius: 12px; }

  .qp-choices { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
  .qp-choice {
    display: flex; align-items: center; gap: 14px; padding: 16px 20px;
    background: var(--bg-secondary); border: 2px solid var(--border-color);
    border-radius: 14px; cursor: pointer; transition: all .2s; text-align: left;
  }
  .qp-choice:hover { border-color: var(--primary); background: var(--bg-tertiary); transform: translateX(4px); }
  .qp-choice.selected { border-color: var(--primary); background: rgba(99,102,241,.08); }
  .qp-choice-letter {
    width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    background: var(--bg-tertiary); border-radius: 10px; font-weight: 700; flex-shrink: 0; transition: all .2s;
  }
  .qp-choice.selected .qp-choice-letter { background: var(--primary); color: #fff; }
  .qp-choice-text { flex: 1; color: var(--text-primary); }
  .qp-choice-check { color: var(--primary); flex-shrink: 0; }

  .qp-nav { display: flex; justify-content: space-between; gap: 12px; }

  .qp-qmap {
    background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 16px; padding: 16px 20px;
  }
  .qp-qmap-label { font-size: .75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 10px; }
  .qp-qmap-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .qp-qmap-dot {
    width: 36px; height: 36px; border-radius: 10px; font-size: .85rem; font-weight: 600;
    background: var(--bg-secondary); border: 1.5px solid var(--border-color);
    cursor: pointer; transition: all .15s; color: var(--text-secondary);
  }
  .qp-qmap-dot:hover { border-color: var(--primary); }
  .qp-qmap-dot.current { background: var(--primary); border-color: var(--primary); color: #fff; }
  .qp-qmap-dot.answered { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.4); color: #22c55e; }
  .qp-qmap-dot.current.answered { background: var(--primary); color: #fff; }

  /* RESULTS */
  .qp-results { max-width: 780px; margin: 0 auto; }
  .qp-res-hero {
    position: relative; text-align: center; padding: 48px 24px 36px;
    border-radius: 24px; margin-bottom: 24px; overflow: hidden;
  }
  .qp-res-hero.pass { background: linear-gradient(135deg, rgba(34,197,94,.12), rgba(16,185,129,.08)); border: 1px solid rgba(34,197,94,.2); }
  .qp-res-hero.fail { background: linear-gradient(135deg, rgba(249,115,22,.12), rgba(234,88,12,.08)); border: 1px solid rgba(249,115,22,.2); }
  .qp-res-glow {
    position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,.06), transparent 70%);
  }
  .qp-res-emoji { font-size: 64px; margin-bottom: 12px; position: relative; }
  .qp-res-hero h1 { margin: 0 0 4px; position: relative; }
  .qp-res-hero p { margin: 0; color: var(--text-secondary); position: relative; }

  .qp-res-score-row {
    display: flex; align-items: center; justify-content: center; gap: 40px;
    padding: 32px; background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 20px; margin-bottom: 24px;
  }
  .qp-res-ring { position: relative; width: 120px; height: 120px; }
  .qp-res-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .qp-ring-bg { fill: none; stroke: var(--bg-tertiary); stroke-width: 8; }
  .qp-ring-fill {
    fill: none; stroke: var(--ring-color); stroke-width: 8;
    stroke-linecap: round; transition: stroke-dasharray .8s ease;
  }
  .qp-ring-center {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .qp-ring-grade { font-size: 2rem; font-weight: 800; line-height: 1; }
  .qp-ring-pct { font-size: .85rem; color: var(--text-secondary); }

  .qp-res-stats { display: flex; flex-direction: column; gap: 12px; }
  .qp-res-stat { display: flex; align-items: center; gap: 10px; font-weight: 500; color: var(--text-secondary); }
  .qp-res-stat.glow-xp { color: #22c55e; font-weight: 700; }
  .qp-green { color: #22c55e; }

  .qp-res-breakdown {
    background: var(--bg-primary); border: 1px solid var(--border-color);
    border-radius: 20px; padding: 28px; margin-bottom: 24px;
  }
  .qp-res-breakdown h3 { display: flex; align-items: center; gap: 8px; margin: 0 0 20px; font-size: 1.05rem; }

  .qp-res-q { padding: 20px; border-radius: 14px; margin-bottom: 12px; border-left: 4px solid; }
  .qp-res-q.correct { background: rgba(34,197,94,.04); border-left-color: #22c55e; }
  .qp-res-q.incorrect { background: rgba(239,68,68,.04); border-left-color: #ef4444; }
  .qp-res-q-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .qp-res-q-num { font-weight: 700; font-size: .85rem; color: var(--text-secondary); }
  .qp-res-q-badge { display: inline-flex; align-items: center; gap: 4px; font-size: .8rem; font-weight: 600; padding: 4px 12px; border-radius: 8px; }
  .qp-res-q-badge.correct { background: rgba(34,197,94,.12); color: #22c55e; }
  .qp-res-q-badge.incorrect { background: rgba(239,68,68,.12); color: #ef4444; }
  .qp-res-q-text { font-size: .95rem; line-height: 1.6; margin-bottom: 12px; }
  .qp-res-q-img { max-width: 100%; max-height: 300px; object-fit: contain; margin: 8px auto 12px; display: block; border-radius: 10px; }

  .qp-res-q-compare { padding: 14px; background: var(--bg-secondary); border-radius: 10px; margin-bottom: 10px; }
  .qp-res-ans { margin-bottom: 8px; }
  .qp-res-ans-label { font-size: .7rem; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 2px; letter-spacing: .5px; }
  .qp-res-ans.wrong span:last-child { color: #ef4444; }
  .qp-res-ans.right span:last-child { color: #22c55e; }
  .qp-ai-explain-btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
    border-radius: 8px; background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(168,85,247,.1));
    border: 1px solid rgba(99,102,241,.25); color: var(--primary); font-weight: 600;
    font-size: .8rem; cursor: pointer; margin-top: 8px; transition: all .2s;
  }
  .qp-ai-explain-btn:hover { background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.18)); }

  .qp-res-q-explanation {
    display: flex; align-items: flex-start; gap: 8px; padding: 12px; background: var(--bg-secondary);
    border-radius: 8px; font-size: .85rem; color: var(--text-secondary); line-height: 1.5;
  }

  .qp-res-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* RTL Support (Arabic) */
  .qp-rtl { direction: rtl; text-align: right; }
  .qp-rtl .qp-q-text, .qp-rtl .qp-choice-text, .qp-rtl .qp-res-q-text,
  .qp-rtl .qp-res-ans span:last-child, .qp-rtl .qp-res-q-explanation { direction: rtl; text-align: right; }
  .qp-rtl .qp-choice { flex-direction: row-reverse; text-align: right; }
  .qp-rtl .qp-choice:hover { transform: translateX(-4px); }
  .qp-rtl .qp-nav { flex-direction: row-reverse; }
  .qp-rtl .qp-topbar-inner { flex-direction: row-reverse; }
  .qp-rtl .qp-topbar-left { text-align: right; }
  .qp-rtl .qp-q-header { flex-direction: row-reverse; }
  .qp-rtl .qp-res-q { border-left: none; border-right: 4px solid; }
  .qp-rtl .qp-res-q.correct { border-right-color: #22c55e; }
  .qp-rtl .qp-res-q.incorrect { border-right-color: #ef4444; }
  .qp-rtl .qp-res-q-head { flex-direction: row-reverse; }
  .qp-rtl .qp-res-ans-label { text-align: right; }
  .qp-rtl .qp-start-actions { direction: ltr; }
  .qp-rtl .qp-res-actions { direction: ltr; }
  .qp-rtl .qp-btn { direction: ltr; }

  /* Responsive */
  @media (max-width: 600px) {
    .qp-start-stats { grid-template-columns: repeat(2, 1fr); }
    .qp-res-score-row { flex-direction: column; gap: 20px; }
    .qp-question-card { padding: 20px; }
    .qp-topbar { padding: 10px 16px 0; }
    .qp-active-body { padding: 0 12px; }
    .qp-start-hero { padding: 32px 16px 24px; }
    .qp-start-hero h1 { font-size: 1.3rem; }
  }
`;

export default QuizPage;
