import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

  // Check if user already completed this quiz
  const { data: userStats } = useQuery({
    queryKey: ['user-stats-quiz-check'],
    queryFn: async () => {
      const res = await api.get('/auth/me/stats');
      return res.data.data;
    },
    staleTime: 1000 * 60 // 1 minute cache
  });

  // Fetch quiz data
  const { data: quizApiData, isLoading, error } = useQuery({
    queryKey: ['quiz-data', subjectId, topicId],
    queryFn: async () => {
      // If topicId looks like a Mongo ObjectId, attempt direct fetch by id.
      // Otherwise skip directly to the topic-based endpoint which handles slug-like ids (e.g., 'upstream:1').
      const isObjectId = (id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);

      if (isObjectId(topicId)) {
        try {
          const response = await fetch(`/api/quizzes/${topicId}`);
          if (response.ok) {
            const result = await response.json();
            return result.data;
          }
        } catch (e) {
          // ignore and fall back
          console.debug('Quiz not found by ID, falling back to topic-based fetch', e?.message || e);
        }
      }

      const response = await fetch(`/api/home/quiz/${subjectId}/${encodeURIComponent(topicId)}`);
      if (!response.ok) throw new Error('Failed to fetch quiz data');
      const result = await response.json();
      return result.data;
    },
    enabled: !!subjectId && !!topicId
  });

  // Check if already completed and redirect to review
  useEffect(() => {
    if (userStats?.completedQuizIds && quizApiData?._id) {
      const isCompleted = userStats.completedQuizIds.includes(quizApiData._id.toString());
      if (isCompleted) {
        setAlreadyCompleted(true);
      }
    }
  }, [userStats, quizApiData]);

  const quizData = useMemo(() => quizApiData || {
    id: `${subjectId}-${topicId}`,
    title: topicName || 'Quiz',
    subject: subjectName || 'Subject',
    difficulty: difficulty || 'Medium',
    questions: []
  }, [quizApiData, subjectId, topicId, topicName, subjectName, difficulty]);

  const handleFinishQuiz = useCallback(async () => {
    setSubmittingQuiz(true);
    setTimerStarted(false);

    try {
      const answers = {};
      quizData.questions.forEach(question => {
        const selectedChoice = selectedAnswers[question.id];
        if (selectedChoice && question.choices) {
          const choice = question.choices.find(c => c.id === selectedChoice);
          if (choice) {
            answers[question._id || question.id] = choice.text;
          }
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
            if (score >= 80) {
              success(`🎉 Great job! ${score}% score, +${xpEarned} XP earned!`);
            } else if (score >= 60) {
              success(`👍 Good effort! ${score}% score, +${xpEarned} XP earned`);
            } else {
              success(`Quiz completed! ${score}% score, +${xpEarned} XP earned`);
            }
          }
        } catch (submitError) {
          console.error('Error submitting quiz:', submitError);
          if (submitError.response?.data?.message?.includes('already completed')) {
            showError('You have already completed this quiz');
          }
          // Still show results even if submission fails
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      showError('Failed to submit quiz. Your progress may not be saved.');
    } finally {
      setSubmittingQuiz(false);
      setShowResults(true);
    }
  }, [quizData, selectedAnswers, customTime, timeLeft, useTimer, startTimestamp]);

  // Timer effect
  useEffect(() => {
    if (!timerStarted || showResults || !useTimer || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimeout(() => handleFinishQuiz(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, showResults, timeLeft, handleFinishQuiz, useTimer]);

  // Elapsed timer for no-timer training (updates display)
  useEffect(() => {
    if (!timerStarted || showResults || useTimer) return;

    setElapsedSeconds(0);
    const tick = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    return () => clearInterval(tick);
  }, [timerStarted, showResults, useTimer]);

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div className="spinner-large" />
          <h2>Loading Quiz...</h2>
          <p className="text-secondary">Preparing questions for you</p>
        </div>
      </div>
    );
  }

  // Already completed - redirect to review
  if (alreadyCompleted && quizData?._id) {
    return (
      <div className="page-container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 450, padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2>Quiz Already Completed</h2>
          <p className="text-secondary" style={{ marginBottom: 24 }}>
            You've already taken this quiz. Each quiz can only be taken once, but you can review your answers.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/browse')}>Browse More</button>
            <button className="btn btn-primary" onClick={() => navigate(`/quiz/${quizData._id}/review`)}>
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2>Failed to Load Quiz</h2>
          <p className="text-secondary" style={{ marginBottom: 24 }}>{error.message}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Go Home</button>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  // No questions
  if (quizData.questions.length === 0) {
    return (
      <div className="page-container" style={{minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card p-5" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <h2>No Questions Available</h2>
          <p className="text-secondary" style={{ marginBottom: 24 }}>This quiz doesn't have any questions yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

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

  // Start screen
  if (!timerStarted && !showResults) {
    return (
      <div className="page-container">
        <div className="quiz-start-container">
          <div className="card quiz-start-card">
            <div className="quiz-icon">🎯</div>
            <h1>{quizData.title}</h1>
            <p className="text-secondary" style={{ marginBottom: 24 }}>
              {quizData.subject} • {quizData.difficulty}
            </p>
            
            <div className="quiz-info-grid">
              <div className="quiz-info-item">
                <span className="info-icon">📝</span>
                <span className="info-value">{quizData.questions.length}</span>
                <span className="info-label">Questions</span>
              </div>
              <div className="quiz-info-item">
                <span className="info-icon">⏱️</span>
                <span className="info-value">{customTime}</span>
                <span className="info-label">Minutes</span>
              </div>
              <div className="quiz-info-item">
                <span className="info-icon">💡</span>
                <span className="info-value">∞</span>
                <span className="info-label">AI Hints</span>
              </div>
            </div>

            <div className="timer-selector">
              <label>Use Timer:</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={useTimer} onChange={(e) => setUseTimer(!!e.target.checked)} />
                  <span style={{ fontSize: 14 }}>{useTimer ? 'Enabled' : 'Disabled'}</span>
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ fontSize: 14 }}>Minutes:</label>
                  <input
                    type="number"
                    min={1}
                    value={customTime}
                    onChange={(e) => setCustomTime(Number(e.target.value) || 1)}
                    style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}
                    disabled={!useTimer}
                  />
                </div>
              </div>

              <div className="timer-presets">
                {[10, 15, 30, 45, 60].map((time) => (
                  <button
                    key={time}
                    onClick={() => setCustomTime(time)}
                    className={`preset-btn ${customTime === time ? 'active' : ''}`}
                    disabled={!useTimer}
                  >
                    {time}m
                  </button>
                ))}
              </div>
            </div>

            <div className="ai-feature-banner">
              <span className="ai-icon">🤖</span>
              <div>
                <strong>AI Hints Available!</strong>
                <p>Get up to 3 hints per question from our AI tutor</p>
              </div>
            </div>

            <div className="quiz-actions">
              <button className="btn btn-primary btn-large" onClick={startQuiz}>
                Start Quiz
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          </div>
        </div>

        <style>{`
          .quiz-start-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
            padding: 40px 20px 100px;
          }

          .quiz-start-card {
            max-width: 500px;
            text-align: center;
          }

          .quiz-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .quiz-info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          .quiz-info-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px;
            background: var(--bg-secondary);
            border-radius: 12px;
          }

          .info-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }

          .info-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
          }

          .info-label {
            font-size: 12px;
            color: var(--text-secondary);
          }

          .timer-selector {
            margin-bottom: 24px;
          }

          .timer-selector label {
            display: block;
            margin-bottom: 12px;
            font-weight: 500;
          }

          .timer-presets {
            display: flex;
            gap: 8px;
            justify-content: center;
          }

          .preset-btn {
            padding: 10px 16px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .preset-btn:hover {
            border-color: var(--primary);
          }

          .preset-btn.active {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
          }

          .ai-feature-banner {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
            border: 1px solid var(--primary);
            border-radius: 12px;
            margin-bottom: 24px;
            text-align: left;
          }

          .ai-icon {
            font-size: 32px;
          }

          .ai-feature-banner p {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
          }

          .quiz-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .btn-large {
            padding: 16px 32px;
            font-size: 16px;
          }

          @media (max-width: 480px) {
            .quiz-start-container {
              min-height: auto;
              padding: 20px 0 100px;
            }

            .quiz-start-card {
              padding: 20px;
            }

            .quiz-icon {
              font-size: 48px;
              margin-bottom: 12px;
            }

            .quiz-start-card h1 {
              font-size: 20px;
              margin-bottom: 8px;
            }

            .quiz-info-grid {
              gap: 8px;
              margin-bottom: 16px;
            }

            .quiz-info-item {
              padding: 10px 6px;
            }

            .info-icon {
              font-size: 16px;
              margin-bottom: 4px;
            }

            .info-value {
              font-size: 16px;
            }

            .info-label {
              font-size: 10px;
            }

            .timer-selector {
              margin-bottom: 16px;
            }
            
            .timer-selector label {
              font-size: 14px;
            }

            .timer-presets {
              gap: 6px;
            }

            .preset-btn {
              padding: 8px 10px;
              font-size: 12px;
            }

            .ai-feature-banner {
              padding: 10px;
              margin-bottom: 16px;
              gap: 10px;
            }

            .ai-icon {
              font-size: 22px;
            }

            .ai-feature-banner strong {
              font-size: 13px;
            }

            .ai-feature-banner p {
              font-size: 11px;
            }

            .btn-large {
              padding: 12px 20px;
              font-size: 14px;
            }
            
            .quiz-actions {
              gap: 8px;
            }
            
            .quiz-actions .btn {
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const results = calculateResults();
    
    return (
      <div className="page-container">
        <div className="results-container">
          <div className={`results-header ${results.percentage >= 70 ? 'success' : results.percentage >= 50 ? 'warning' : 'error'}`}>
            <div className="results-icon">
              {results.percentage >= 70 ? '🏆' : results.percentage >= 50 ? '👍' : '💪'}
            </div>
            <h1>Quiz Complete!</h1>
            <p>
              {results.percentage >= 90 ? "Outstanding!" : 
               results.percentage >= 70 ? "Great job!" :
               results.percentage >= 50 ? "Good effort!" : "Keep practicing!"}
            </p>
          </div>

          <div className="results-stats">
            <div className="stat-item">
              <span className="stat-value">{results.percentage}%</span>
              <span className="stat-label">Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{results.correct}/{results.total}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formatTime(results.timeUsed)}</span>
              <span className="stat-label">Time</span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-value">+{results.xpEarned}</span>
              <span className="stat-label">XP Earned</span>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Question Breakdown</h3>
            
            {quizData.questions.map((question, index) => {
              const selectedChoice = selectedAnswers[question.id];
              const userChoice = question.choices.find(c => c.id === selectedChoice);
              const correctChoice = question.choices.find(c => c.isCorrect);
              const isCorrect = userChoice && userChoice.isCorrect;

              return (
                <div key={question.id} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-result-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  
                  <div className="question-text">
                    <LaTeXRenderer content={question.question} />
                    {question.image_url && (
                      <img 
                        src={question.image_url}
                        alt="Question illustration" 
                        className="question-image"
                      />
                    )}
                  </div>

                  {!isCorrect && (
                    <div className="answer-comparison">
                      <div className="your-answer">
                        <span className="label">Your answer:</span>
                        <span className="answer-text">
                          {userChoice ? <LaTeXRenderer content={userChoice.text} /> : 'No answer'}
                        </span>
                      </div>
                      <div className="correct-answer">
                        <span className="label">Correct answer:</span>
                        <span className="answer-text">
                          <LaTeXRenderer content={correctChoice?.text || ''} />
                        </span>
                      </div>
                      
                      <button 
                        className="btn btn-ai"
                        onClick={() => setShowAIExplanation({
                          question: question.question,
                          userAnswer: userChoice?.text || 'No answer',
                          correctAnswer: correctChoice?.text || '',
                          subject: quizData.subject
                        })}
                      >
                        🤖 Get AI Explanation
                      </button>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="explanation-box">
                      <strong>📚 Explanation:</strong>
                      <LaTeXRenderer content={question.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Retake Quiz
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back to Home
            </button>
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
          .results-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .results-header {
            text-align: center;
            padding: 40px;
            border-radius: 16px;
            margin-bottom: 24px;
          }

          .results-header.success {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
            border: 1px solid rgba(34, 197, 94, 0.3);
          }

          .results-header.warning {
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
            border: 1px solid rgba(251, 191, 36, 0.3);
          }

          .results-header.error {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
            border: 1px solid rgba(239, 68, 68, 0.3);
          }

          .results-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .results-header h1 {
            margin: 0 0 8px;
          }

          .results-header p {
            margin: 0;
            color: var(--text-secondary);
          }

          .results-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          @media (max-width: 600px) {
            .results-stats {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          .stat-item {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          }

          .stat-item.highlight {
            background: linear-gradient(135deg, var(--primary), #a855f7);
            border: none;
            color: white;
          }

          .stat-item .stat-value {
            display: block;
            font-size: 28px;
            font-weight: 700;
          }

          .stat-item .stat-label {
            font-size: 13px;
            color: var(--text-secondary);
          }

          .stat-item.highlight .stat-label {
            color: rgba(255, 255, 255, 0.8);
          }

          .question-result {
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 16px;
            border-left: 4px solid;
          }

          .question-result.correct {
            background: rgba(34, 197, 94, 0.05);
            border-left-color: #22c55e;
          }

          .question-result.incorrect {
            background: rgba(239, 68, 68, 0.05);
            border-left-color: #ef4444;
          }

          .question-result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
          }

          .question-number {
            font-weight: 600;
            font-size: 14px;
            color: var(--text-secondary);
          }

          .result-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          .result-badge.correct {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
          }

          .result-badge.incorrect {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
          }

          .question-text {
            color: var(--text-primary);
            margin-bottom: 16px;
          }

          .answer-comparison {
            padding: 16px;
            background: var(--bg-secondary);
            border-radius: 8px;
            margin-bottom: 12px;
          }

          .your-answer, .correct-answer {
            margin-bottom: 8px;
          }

          .answer-comparison .label {
            font-size: 11px;
            text-transform: uppercase;
            color: var(--text-secondary);
            display: block;
            margin-bottom: 4px;
          }

          .your-answer .answer-text {
            color: #ef4444;
          }

          .correct-answer .answer-text {
            color: #22c55e;
          }

          .btn-ai {
            background: linear-gradient(135deg, var(--primary), #a855f7);
            color: white;
            margin-top: 12px;
          }

          .explanation-box {
            padding: 12px;
            background: var(--bg-secondary);
            border-radius: 8px;
            font-size: 14px;
            color: var(--text-secondary);
          }

          .explanation-box strong {
            display: block;
            margin-bottom: 6px;
            color: var(--text-primary);
          }

          .results-actions {
            display: flex;
            gap: 16px;
            margin-top: 24px;
          }

          .results-actions .btn {
            flex: 1;
          }
        `}</style>
      </div>
    );
  }

  // Quiz in progress
  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="page-container quiz-active">
      {/* Timer Bar */}
      <div className="quiz-timer-bar">
        <div className="timer-content">
          <span className="quiz-title">{quizData.title}</span>
          <span className={`timer ${useTimer ? (timeLeft < 60 ? 'urgent' : timeLeft < 300 ? 'warning' : '') : ''}`}>
            ⏱️ {useTimer ? formatTime(timeLeft) : `No timer • ${formatTime(elapsedSeconds)}`}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="quiz-content">
        <div className="card question-card">
          <div className="question-header">
            <span className="question-counter">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </span>
            <AIHintButton
              question={question.question}
              options={question.choices.map(c => c.text)}
              subject={quizData.subject}
              disabled={!!selectedAnswers[question.id]}
            />
          </div>

          <div className="question-text-main">
            <LaTeXRenderer content={question.question} />
            {question.image_url && (
              <img 
                src={question.image_url}
                alt="Question illustration" 
                className="question-image"
              />
            )}
          </div>

          <div className="choices-list">
            {question.choices.map((choice, index) => (
              <button
                key={choice.id}
                onClick={() => handleAnswerSelect(question.id, choice.id)}
                className={`choice-btn ${selectedAnswers[question.id] === choice.id ? 'selected' : ''}`}
              >
                <span className="choice-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="choice-text">
                  <LaTeXRenderer content={choice.text} />
                </span>
                {selectedAnswers[question.id] === choice.id && (
                  <span className="check-mark">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="quiz-navigation">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>

            {currentQuestion === quizData.questions.length - 1 ? (
              <button className="btn btn-success" onClick={() => setShowConfirmSubmit(true)} disabled={submittingQuiz}>
                {submittingQuiz ? 'Submitting...' : 'Finish Quiz'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentQuestion(prev => Math.min(quizData.questions.length - 1, prev + 1))}
              >
                Next →
              </button>
            )}
          </div>

          {/* Submit Confirmation Modal */}
          <ConfirmModal
            isOpen={showConfirmSubmit}
            title="Submit Quiz?"
            message={(() => {
              const answered = Object.keys(selectedAnswers).length;
              const total = quizData.questions.length;
              const unanswered = total - answered;
              if (unanswered > 0) {
                return `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`;
              }
              return "You've answered all questions. Ready to submit?";
            })()}
            confirmText="Submit Quiz"
            cancelText="Review Answers"
            type={Object.keys(selectedAnswers).length < quizData.questions.length ? 'warning' : 'success'}
            onConfirm={() => {
              setShowConfirmSubmit(false);
              handleFinishQuiz();
            }}
            onCancel={() => setShowConfirmSubmit(false)}
          />
        </div>

        {/* Question Navigator */}
        <div className="question-navigator">
          {quizData.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(idx)}
              className={`nav-dot ${idx === currentQuestion ? 'current' : ''} ${selectedAnswers[q.id] ? 'answered' : ''}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .quiz-active {
          padding-top: 0;
          padding-bottom: 100px;
        }

        .quiz-timer-bar {
          position: sticky;
          top: 64px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          z-index: 100;
          padding: 12px 24px 0;
        }

        .timer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .quiz-title {
          font-weight: 600;
        }

        .timer {
          font-family: monospace;
          font-size: 18px;
          font-weight: 600;
          padding: 6px 14px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }

        .timer.warning {
          background: rgba(251, 191, 36, 0.2);
          color: #f59e0b;
        }

        .timer.urgent {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .progress-bar {
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), #a855f7);
          transition: width 0.3s ease;
        }

        .quiz-content {
          max-width: 800px;
          margin: 24px auto 0;
          padding: 0 24px;
        }

        .question-card {
          margin-bottom: 24px;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .question-counter {
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .question-text-main {
          font-size: 18px;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 32px;
        }

        .question-image {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          margin: 16px auto;
          display: block;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .choices-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .choice-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .choice-btn:hover {
          border-color: var(--primary);
          background: var(--bg-tertiary);
        }

        .choice-btn.selected {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
        }

        .choice-letter {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border-radius: 8px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .choice-btn.selected .choice-letter {
          background: var(--primary);
          color: white;
        }

        .choice-text {
          flex: 1;
          color: var(--text-primary);
        }

        .check-mark {
          color: var(--primary);
          font-size: 20px;
        }

        .quiz-navigation {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .btn-success {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border: none;
        }

        .btn-success:hover {
          background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .question-navigator {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          padding: 20px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
        }

        .nav-dot {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-dot:hover {
          border-color: var(--primary);
        }

        .nav-dot.current {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .nav-dot.answered {
          background: rgba(34, 197, 94, 0.2);
          border-color: rgba(34, 197, 94, 0.5);
          color: #22c55e;
        }

        .nav-dot.current.answered {
          background: var(--primary);
          color: white;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid var(--bg-tertiary);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 24px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuizPage;
