import { useState } from "react";
import { CheckCircle, XCircle, HelpCircle, Brain, Clock, BarChart3 } from "lucide-react";

export default function QuestionCard({ question }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowAnswer(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return <BarChart3 className="w-4 h-4" />;
      case 'medium': return <BarChart3 className="w-4 h-4" />;
      case 'hard': return <BarChart3 className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="card card-hover group">
      {/* header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Question</h3>
            <p className="text-sm text-gray-500">#{question._id?.slice(-6)}</p>
          </div>
        </div>
        
        {/* difficulty badge */}
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
          {getDifficultyIcon(question.difficulty)}
          <span className="capitalize">{question.difficulty || 'Unknown'}</span>
        </div>
      </div>

      {/* question text */}
      <div className="mb-6">
        <p className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* options */}
      {question.options?.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Choose your answer:</h4>
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === question.correctAnswer;
            const isWrong = showAnswer && isSelected && !isCorrect;
            const shouldShowCorrect = showAnswer && isCorrect;

            let optionClass = "w-full text-left p-4 border-2 rounded-lg transition-all duration-200 hover:border-blue-300 focus:outline-none focus:border-blue-500";
            
            if (shouldShowCorrect) {
              optionClass += " border-green-500 bg-green-50 text-green-900";
            } else if (isWrong) {
              optionClass += " border-red-500 bg-red-50 text-red-900";
            } else if (isSelected) {
              optionClass += " border-blue-500 bg-blue-50 text-blue-900";
            } else {
              optionClass += " border-gray-200 bg-white hover:bg-gray-50";
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={showAnswer}
                className={optionClass}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>
                  
                  {showAnswer && (
                    <div className="flex-shrink-0">
                      {shouldShowCorrect && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      {isWrong && (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* explaination */}
      {showAnswer && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
          <p className="text-blue-800 text-sm leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Subject: {question.subject}</span>
          </div>
        </div>
        
        {!showAnswer && (
          <div className="text-xs text-gray-400">
            Click an option to reveal answer
          </div>
        )}
      </div>
    </div>
  );
}
