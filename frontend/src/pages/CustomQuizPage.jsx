import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import LaTeXRenderer from "../components/common/LaTeXRenderer";
import AIHintButton from "../components/ai/AIHintButton";
import AIExplanation from "../components/ai/AIExplanation";

export default function CustomQuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showAIExplanation, setShowAIExplanation] = useState(null);
  
  const timerRef = useRef(null);
  
  // Get params
  const subject = searchParams.get('subject') || 'Math';
  const source = searchParams.get('source');
  const topic = searchParams.get('topic');
  const count = parseInt(searchParams.get('count') || '10');
  const difficulty = searchParams.get('difficulty') || 'all';
  const timeLimit = parseInt(searchParams.get('timeLimit') || '60');

  const getSampleQuestions = useCallback(() => [
    {
      _id: '1',
      title: 'Sample Question',
      question_text: 'This is a sample question. The actual questions will load from the database.',
      choices: [
        { id: 'A', text: 'Option A', is_correct: true },
        { id: 'B', text: 'Option B', is_correct: false },
        { id: 'C', text: 'Option C', is_correct: false },
        { id: 'D', text: 'Option D', is_correct: false },
      ],
      difficulty: 'medium',
      explanation: 'This is the explanation for the correct answer.'
    }
  ], []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        subject,
        count: count.toString(),
        ...(source && { source }),
        ...(topic && { topic }),
        ...(difficulty !== 'all' && { difficulty })
      });
      
      const response = await api.get(`/questions/quiz?${params.toString()}`);
      
      if (response.data.success && response.data.questions.length > 0) {
        setQuestions(response.data.questions);
        setTimeLeft(timeLimit);
      } else {
        // Fallback sample questions
        setQuestions(getSampleQuestions());
        setTimeLeft(timeLimit);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setQuestions(getSampleQuestions());
      setTimeLeft(timeLimit);
    } finally {
      setLoading(false);
    }
  }, [subject, source, topic, count, difficulty, timeLimit, getSampleQuestions]);

  useEffect(() => {
    fetchQuestions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchQuestions]);

  const startQuiz = () => {
    setQuizStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext();
          return timeLimit;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (choiceId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: choiceId
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(timeLimit);
    } else {
      endQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const endQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const correctChoice = q.choices.find(c => c.is_correct);
      if (selected === correctChoice?.id) correct++;
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  if (loading) {
    return (
      <div className="quiz-container loading-state">
        <div className="loading-content">
          <div className="loading-icon">📚</div>
          <h2>Loading Questions...</h2>
          <p>Preparing your {subject} quiz</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="quiz-container">
        <div className="start-screen">
          <div className="start-icon">🎯</div>
          <h1>Ready to Start?</h1>
          <div className="quiz-info">
            <div className="info-item">
              <span className="info-label">Subject</span>
              <span className="info-value">{subject}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Questions</span>
              <span className="info-value">{questions.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Time/Question</span>
              <span className="info-value">{timeLimit}s</span>
            </div>
            <div className="info-item">
              <span className="info-label">Difficulty</span>
              <span className="info-value">{difficulty}</span>
            </div>
          </div>
          <button className="start-btn" onClick={startQuiz}>
            🚀 Start Quiz
          </button>
          <button className="back-btn" onClick={() => navigate('/browse')}>
            ← Back to Browse
          </button>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="quiz-container">
        <div className="results-screen">
          <div className="results-header">
            <div className="score-circle">
              <span className="score-percentage">{score.percentage}%</span>
              <span className="score-label">Score</span>
            </div>
            <h1>{score.percentage >= 80 ? '🎉 Excellent!' : score.percentage >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}</h1>
            <p>You got {score.correct} out of {score.total} questions correct</p>
          </div>

          <div className="results-breakdown">
            <h3>📊 Question Breakdown</h3>
            {questions.map((q, idx) => {
              const selected = selectedAnswers[idx];
              const correctChoice = q.choices.find(c => c.is_correct);
              const userChoice = q.choices.find(c => c.id === selected);
              const isCorrect = selected === correctChoice?.id;
              
              return (
                <div key={idx} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-status">{isCorrect ? '✓' : '✗'}</div>
                  <div className="result-content">
                    <div className="result-question">
                      <LaTeXRenderer text={q.question_text || q.question} />
                    </div>
                    
                    {!isCorrect && (
                      <div className="answer-comparison">
                        <div className="your-answer">
                          <span className="answer-label">Your answer:</span>
                          <span className="answer-text wrong">
                            <LaTeXRenderer text={userChoice?.text || 'No answer'} />
                          </span>
                        </div>
                        <div className="correct-answer">
                          <span className="answer-label">Correct answer:</span>
                          <span className="answer-text right">
                            <LaTeXRenderer text={correctChoice?.text || 'N/A'} />
                          </span>
                        </div>
                        <button 
                          className="ai-explain-btn"
                          onClick={() => setShowAIExplanation({
                            question: q.question_text || q.question,
                            userAnswer: userChoice?.text || 'No answer',
                            correctAnswer: correctChoice?.text || '',
                            subject: subject
                          })}
                        >
                          🤖 Get AI Explanation
                        </button>
                      </div>
                    )}
                    
                    {/* Show stored explanation if available */}
                    {q.explanation && (
                      <div className="explanation-box">
                        <strong>📚 Explanation:</strong>
                        <LaTeXRenderer text={q.explanation} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button className="action-btn primary" onClick={() => {
              setShowResults(false);
              setCurrentIndex(0);
              setSelectedAnswers({});
              setQuizStarted(false);
              fetchQuestions();
            }}>
              🔄 Try Again
            </button>
            <button className="action-btn" onClick={() => navigate('/browse')}>
              📚 Browse More
            </button>
          </div>
        </div>

        {/* AI Explanation Modal */}
        {showAIExplanation && (
          <AIExplanation
            question={showAIExplanation.question}
            userAnswer={showAIExplanation.userAnswer}
            correctAnswer={showAIExplanation.correctAnswer}
            subject={showAIExplanation.subject}
            onClose={() => setShowAIExplanation(null)}
          />
        )}

        <style>{styles}</style>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = selectedAnswers[currentIndex];

  return (
    <div className="quiz-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="quiz-header">
        <div className="question-counter">
          Question {currentIndex + 1} / {questions.length}
        </div>
        <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Question */}
      <div className="question-card">
        <div className="question-header">
          <div className="difficulty-badge" data-difficulty={currentQuestion.difficulty}>
            {currentQuestion.difficulty}
          </div>
          <AIHintButton
            question={currentQuestion.question_text || currentQuestion.question}
            options={currentQuestion.choices.map(c => c.text)}
            subject={subject}
            disabled={!!selectedAnswer}
            staticHint={currentQuestion.hint}
          />
        </div>
        <div className="question-text">
          <LaTeXRenderer text={currentQuestion.question_text || currentQuestion.question} />
        </div>

        {/* Options */}
        <div className="options-grid">
          {currentQuestion.choices.map((choice) => (
            <button
              key={choice.id}
              className={`option-btn ${selectedAnswer === choice.id ? 'selected' : ''}`}
              onClick={() => handleAnswer(choice.id)}
            >
              <span className="option-letter">{choice.id}</span>
              <span className="option-text">
                <LaTeXRenderer text={choice.text} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button 
          className="nav-btn" 
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        
        <div className="question-dots">
          {questions.map((_, idx) => (
            <button
              key={idx}
              className={`dot ${idx === currentIndex ? 'current' : ''} ${selectedAnswers[idx] ? 'answered' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        {currentIndex === questions.length - 1 ? (
          <button className="nav-btn finish" onClick={endQuiz}>
            Finish Quiz ✓
          </button>
        ) : (
          <button className="nav-btn" onClick={handleNext}>
            Next →
          </button>
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .quiz-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    min-height: 80vh;
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-content {
    text-align: center;
  }

  .loading-icon {
    font-size: 64px;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* Start Screen */
  .start-screen {
    text-align: center;
    padding: 60px 20px;
  }

  .start-icon {
    font-size: 80px;
    margin-bottom: 24px;
  }

  .start-screen h1 {
    margin-bottom: 32px;
  }

  .quiz-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    max-width: 400px;
    margin: 0 auto 40px;
  }

  .info-item {
    background: var(--bg-secondary);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }

  .info-label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .info-value {
    font-size: 1.1rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .start-btn {
    padding: 16px 48px;
    font-size: 1.2rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--primary), #a855f7);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    margin-bottom: 16px;
    display: block;
    width: 100%;
    max-width: 300px;
    margin: 0 auto 16px;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
  }

  .back-btn {
    background: transparent;
    border: 1px solid var(--border-color);
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-secondary);
  }

  /* Progress Bar */
  .progress-bar {
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: 3px;
    margin-bottom: 24px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), #a855f7);
    transition: width 0.3s ease;
  }

  /* Header */
  .quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .question-counter {
    font-weight: 600;
    color: var(--text-secondary);
  }

  .timer {
    font-size: 1.25rem;
    font-weight: 700;
    padding: 8px 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }

  .timer.warning {
    background: #fef2f2;
    color: #dc2626;
    animation: shake 0.5s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  /* Question Card */
  .question-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
  }

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .difficulty-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .difficulty-badge[data-difficulty="easy"] {
    background: #dcfce7;
    color: #16a34a;
  }

  .difficulty-badge[data-difficulty="medium"] {
    background: #fef3c7;
    color: #d97706;
  }

  .difficulty-badge[data-difficulty="hard"] {
    background: #fee2e2;
    color: #dc2626;
  }

  /* Answer comparison in results */
  .answer-comparison {
    padding: 16px;
    background: var(--bg-tertiary);
    border-radius: 8px;
    margin-top: 12px;
  }

  .your-answer, .correct-answer {
    margin-bottom: 8px;
  }

  .answer-label {
    font-size: 11px;
    text-transform: uppercase;
    color: var(--text-secondary);
    display: block;
    margin-bottom: 4px;
  }

  .answer-text.wrong {
    color: #ef4444;
  }

  .answer-text.right {
    color: #22c55e;
  }

  .ai-explain-btn {
    margin-top: 12px;
    padding: 10px 20px;
    background: linear-gradient(135deg, var(--primary), #a855f7);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .ai-explain-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  }

  .explanation-box {
    padding: 12px 16px;
    background: rgba(99, 102, 241, 0.1);
    border-left: 3px solid var(--primary);
    border-radius: 0 8px 8px 0;
    margin-top: 12px;
    font-size: 14px;
  }

  .explanation-box strong {
    display: block;
    margin-bottom: 6px;
    color: var(--text-primary);
  }

  .question-text {
    font-size: 1.2rem;
    line-height: 1.7;
    margin-bottom: 32px;
  }

  /* Options */
  .options-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .option-btn {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }

  .option-btn:hover {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.05);
  }

  .option-btn.selected {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.1);
  }

  .option-letter {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: 50%;
    font-weight: 700;
    flex-shrink: 0;
  }

  .option-btn.selected .option-letter {
    background: var(--primary);
    color: white;
  }

  .option-text {
    flex: 1;
  }

  /* Navigation */
  .quiz-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .nav-btn {
    padding: 12px 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .nav-btn:hover:not(:disabled) {
    border-color: var(--primary);
  }

  .nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-btn.finish {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .question-dots {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    border: 2px solid var(--border-color);
    cursor: pointer;
    padding: 0;
  }

  .dot.current {
    background: var(--primary);
    border-color: var(--primary);
  }

  .dot.answered {
    background: #22c55e;
    border-color: #22c55e;
  }

  /* Results Screen */
  .results-screen {
    padding: 40px 20px;
  }

  .results-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .score-circle {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), #a855f7);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }

  .score-percentage {
    font-size: 2.5rem;
    font-weight: 700;
  }

  .score-label {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .results-breakdown {
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
  }

  .results-breakdown h3 {
    margin-bottom: 20px;
  }

  .result-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 12px;
    background: var(--bg-tertiary);
  }

  .result-item.correct {
    border-left: 4px solid #22c55e;
  }

  .result-item.incorrect {
    border-left: 4px solid #ef4444;
  }

  .result-status {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .result-item.correct .result-status {
    background: #dcfce7;
    color: #16a34a;
  }

  .result-item.incorrect .result-status {
    background: #fee2e2;
    color: #dc2626;
  }

  .result-content {
    flex: 1;
  }

  .result-question {
    font-size: 0.95rem;
    margin-bottom: 8px;
  }

  .result-answer {
    font-size: 0.85rem;
    color: #16a34a;
  }

  .results-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }

  .action-btn {
    padding: 14px 32px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
    transition: all 0.2s;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, var(--primary), #a855f7);
    color: white;
    border: none;
  }

  .action-btn:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    .quiz-container { 
      padding-bottom: 100px;
      padding-left: 12px;
      padding-right: 12px;
    }
    
    .quiz-navigation {
      flex-wrap: wrap;
    }
    
    .question-dots {
      order: 3;
      width: 100%;
      margin-top: 16px;
    }
    
    .start-screen {
      padding: 24px 16px;
    }
    
    .start-icon {
      font-size: 48px;
    }
    
    .start-screen h1 {
      font-size: 1.5rem;
    }
    
    .quiz-info {
      gap: 12px;
    }
    
    .info-item {
      padding: 12px 16px;
    }
    
    .start-btn, .back-btn {
      padding: 12px 24px;
      font-size: 0.9rem;
    }
    
    .results-screen {
      padding: 20px 16px;
    }
    
    .score-circle {
      width: 100px;
      height: 100px;
    }
    
    .score-percentage {
      font-size: 1.5rem;
    }
    
    .results-actions {
      flex-direction: column;
      gap: 12px;
    }
    
    .action-btn {
      width: 100%;
      padding: 12px 20px;
    }
  }
`;
