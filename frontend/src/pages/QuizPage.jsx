import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Flag,
  Home,
  RefreshCw,
  Trophy,
  Target,
  Timer
} from 'lucide-react';
import LaTeXRenderer from '../components/common/LaTeXRenderer';

const QuizPage = () => {
  const { subjectId, topicId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('QuizPage loaded with params:', { subjectId, topicId });
  console.log('Location state:', location.state);
  
  const { subjectName, topicName, difficulty, estimatedTime } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(estimatedTime * 60); // Convert to seconds
  const [showResults, setShowResults] = useState(false);
  const [customTime, setCustomTime] = useState(estimatedTime || 30);
  const [timerStarted, setTimerStarted] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // Fetch quiz data from API
  const { data: quizApiData, isLoading: quizLoading, error: quizError } = useQuery({
    queryKey: ['quiz-data', subjectId, topicId],
    queryFn: async () => {
      console.log('Fetching quiz data for:', subjectId, topicId);
      
      // First try to get quiz by ID (if topicId is a quiz ID)
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${topicId}`);
        if (response.ok) {
          const result = await response.json();
          console.log('Quiz data received:', result.data);
          return result.data;
        }
      } catch {
        console.log('Quiz not found by ID, trying topic-based fetch...');
      }
      
      // Fallback to topic-based API
      const response = await fetch(`http://localhost:5000/api/home/quiz/${subjectId}/${topicId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data');
      }
      const result = await response.json();
      console.log('Quiz data received:', result.data);
      return result.data;
    },
    enabled: !!subjectId && !!topicId
  });

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
      // Prepare answers in the format expected by the API
      const answers = {};
      quizData.questions.forEach(question => {
        // Map our frontend answer format to backend format
        const selectedChoice = selectedAnswers[question.id];
        if (selectedChoice && question.choices) {
          const choice = question.choices.find(c => c.id === selectedChoice);
          if (choice) {
            // Use the question's _id for backend and choice text as answer
            answers[question._id || question.id] = choice.text;
          }
        }
      });

      const timeTaken = (customTime * 60 - timeLeft) / 60; // Convert back to minutes

      // Submit quiz if we have a valid quiz ID
      if (quizData._id) {
        console.log('Submitting quiz:', { answers, timeTaken });
        
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/quizzes/${quizData._id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            answers,
            timeTaken
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Quiz submission result:', result);
          setQuizResults(result.data);
        } else {
          console.error('Failed to submit quiz:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmittingQuiz(false);
      setShowResults(true);
    }
  }, [quizData, selectedAnswers, customTime, timeLeft]);

  // Timer effect
  useEffect(() => {
    if (!timerStarted || showResults || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Call finish quiz when timer runs out
          setTimeout(() => handleFinishQuiz(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerStarted, showResults, timeLeft, handleFinishQuiz]);

  // Show loading state while fetching quiz data
  if (quizLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Loading Quiz...</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing {topicName || 'your quiz'} questions...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if quiz failed to load
  if (quizError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Quiz</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {quizError.message || 'Unable to load quiz questions. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if quiz has no questions
  if (quizData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <Target className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Questions Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This {quizData.type === 'quiz' ? 'quiz collection' : 'topic'} doesn't have any questions yet.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>
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
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    // Use real API results if available
    if (quizResults) {
      return {
        correct: quizResults.questionsCorrect,
        total: quizResults.questionsTotal,
        percentage: quizResults.score,
        timeUsed: quizResults.timeTaken * 60, // Convert back to seconds for display
        xpEarned: quizResults.progressUpdate?.xpEarned || 0,
        newLevel: quizResults.progressUpdate?.newLevel || 1,
        currentStreak: quizResults.progressUpdate?.currentStreak || 0
      };
    }

    // Fallback to client-side calculation
    let correct = 0;
    let total = quizData.questions.length;
    
    quizData.questions.forEach(question => {
      const selectedChoice = selectedAnswers[question.id];
      if (selectedChoice) {
        const choice = question.choices.find(c => c.id === selectedChoice);
        if (choice && choice.isCorrect) {
          correct++;
        }
      }
    });

    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100),
      timeUsed: (customTime * 60) - timeLeft,
      xpEarned: correct * 10,
      newLevel: 1,
      currentStreak: 0
    };
  };

  const startQuiz = () => {
    setTimeLeft(customTime * 60);
    setTimerStarted(true);
  };

  if (!timerStarted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {quizData.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {quizData.subject} • {quizData.difficulty}
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {quizData.questions.length} Questions
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {customTime} Minutes
              </span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Set Custom Timer (minutes):
            </label>
            <div className="space-y-4">
              {/* Range Slider */}
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={customTime}
                  onChange={(e) => setCustomTime(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((customTime - 5) / (120 - 5)) * 100}%, #d1d5db ${((customTime - 5) / (120 - 5)) * 100}%, #d1d5db 100%)`
                  }}
                />
                <span className="text-lg font-semibold text-gray-900 dark:text-white w-16">
                  {customTime}m
                </span>
              </div>
              
              {/* Numeric Input */}
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  Or enter manually:
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={customTime}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 5;
                    setCustomTime(Math.min(120, Math.max(5, value)));
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center w-20"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  minutes
                </span>
              </div>

              {/* Quick Time Presets */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Quick select:</span>
                {[10, 15, 30, 45, 60].map((time) => (
                  <button
                    key={time}
                    onClick={() => setCustomTime(time)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      customTime === time 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {time}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={startQuiz}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              <Flag className="w-5 h-5 mr-2" />
              Start Quiz
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-8 mb-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-green-100">
              {results.percentage >= 80 ? "Excellent work! 🎉" : 
               results.percentage >= 60 ? "Good job! 👍" : "Keep practicing! 💪"}
            </p>
            {submittingQuiz && (
              <div className="mt-4 text-yellow-100">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                Saving your progress...
              </div>
            )}
          </div>

          {/* Score Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">{results.percentage}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">{results.correct}/{results.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-1">{formatTime(results.timeUsed)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Used</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">+{results.xpEarned}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">XP Earned</div>
              </div>
              {results.newLevel > 1 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-1">Lv.{results.newLevel}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
                </div>
              )}
            </div>
            
            {/* Progress and Achievement Info */}
            {quizResults && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Progress Update</h3>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  {results.currentStreak > 1 && (
                    <p>🔥 Current streak: {results.currentStreak} days</p>
                  )}
                  <p>📊 Your progress has been saved to your profile</p>
                </div>
              </div>
            )}
          </div>

          {/* Question by Question Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Question Breakdown</h2>
            <div className="space-y-6">
              {quizData.questions.map((question, index) => {
                const selectedChoice = selectedAnswers[question.id];
                const userChoice = question.choices.find(c => c.id === selectedChoice);
                const isCorrect = userChoice && userChoice.isCorrect;

                return (
                  <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Question {index + 1}
                      </h3>
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      <LaTeXRenderer text={question.question} />
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      {question.choices.map((choice) => (
                        <div
                          key={choice.id}
                          className={`p-3 rounded-lg border-2 ${
                            choice.isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : selectedChoice === choice.id && !choice.isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <LaTeXRenderer text={choice.text} />
                            <div>
                              {choice.isCorrect && <span className="text-green-600 ml-2">✓ Correct</span>}
                              {selectedChoice === choice.id && !choice.isCorrect && <span className="text-red-600 ml-2">✗ Your answer</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Explanation:</h4>
                      <div className="text-blue-800 dark:text-blue-200 text-sm">
                        <LaTeXRenderer text={question.explanation} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retake Quiz
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Timer and Progress */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{quizData.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Timer Display with Progress */}
              <div className="text-right">
                <div className={`flex items-center px-4 py-2 rounded-lg ${
                  timeLeft < 300 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(timeLeft)}
                </div>
                {/* Timer Progress Bar */}
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                  <div 
                    className={`h-1 rounded-full transition-all duration-1000 ${
                      timeLeft < 300 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${(timeLeft / (customTime * 60)) * 100}%`,
                      transition: 'width 1s linear'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Question Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Quiz Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <LaTeXRenderer text={question.question} />
          </div>

          <div className="space-y-4 mb-8">
            {question.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleAnswerSelect(question.id, choice.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswers[question.id] === choice.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
                    {choice.id.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <LaTeXRenderer text={choice.text} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentQuestion === quizData.questions.length - 1 ? (
              <button
                onClick={handleFinishQuiz}
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                <Flag className="w-4 h-4 mr-2" />
                Finish Quiz
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;