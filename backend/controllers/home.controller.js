import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";

export const getHomePageData = async (req, res) => {
  try {
    // Define all available subjects (always show these)
    const standardSubjects = [
      'Math',
      'Arabic', 
      'English',
      'Science',
      'Social Studies',
      'Physics',
      'Chemistry',
      'Biology'
    ];

    // Get all published questions
    const questions = await Question.find({ deleted_at: null, published: true })
      .select('subject source title difficulty points')
      .lean();

    // Get all published quizzes
    const quizzes = await Quiz.find({ published: true })
      .populate('questions', 'subject difficulty points')
      .select('title description total_time questions subject source created_by')
      .lean();

    // Build subjects data - always include all standard subjects
    const subjectsData = [];
    
    for (const subject of standardSubjects) {
      const subjectQuestions = questions.filter(q => q.subject === subject);
      const subjectQuizzes = quizzes.filter(q => {
        if (q.subject) return q.subject === subject;
        if (q.questions && q.questions.length > 0) {
          return q.questions.some(question => question.subject === subject);
        }
        return false;
      });

      // Get question-based topics (legacy approach)
      const sources = [...new Set(subjectQuestions.map(q => q.source))].filter(Boolean);
      const questionTopics = sources.map(source => {
        const topicQuestions = subjectQuestions.filter(q => q.source === source);
        
        // Calculate difficulty distribution
        const difficulties = topicQuestions.map(q => q.difficulty);
        const difficultyMode = difficulties.sort((a,b) =>
          difficulties.filter(v => v === a).length - difficulties.filter(v => v === b).length
        ).pop() || 'Intermediate';
        
        // Estimate time based on question count (2 minutes per question, minimum 1 minute)
        const estimatedTime = Math.max(1, Math.min(60, topicQuestions.length * 2));
        
        return {
          id: source.toLowerCase().replace(/\s+/g, '-'),
          name: source,
          type: 'question-topic',
          questions: topicQuestions.length,
          difficulty: difficultyMode,
          estimatedTime: estimatedTime
        };
      });

      // Get quiz-based topics
      const quizTopics = subjectQuizzes.map(quiz => {
        const questionCount = quiz.questions ? quiz.questions.length : 0;
        const difficulties = quiz.questions ? quiz.questions.map(q => q.difficulty).filter(Boolean) : [];
        const difficultyMode = difficulties.length > 0 ? 
          difficulties.sort((a,b) =>
            difficulties.filter(v => v === a).length - difficulties.filter(v => v === b).length
          ).pop() : 'Intermediate';

        return {
          id: quiz._id.toString(),
          name: quiz.title,
          type: 'quiz',
          questions: questionCount,
          difficulty: difficultyMode,
          estimatedTime: quiz.total_time || Math.max(1, questionCount * 2),
          description: quiz.description,
          source: quiz.source
        };
      });

      // Combine all topics
      const allTopics = [...questionTopics, ...quizTopics];

      // Subject icon mapping - Professional icons
      const iconMap = {
        'Math': '∫',
        'Mathematics': '∫',
        'Physics': 'Φ',
        'Chemistry': '⚗',
        'Biology': '🧬',
        'English': 'Ε',
        'Arabic': 'ع',
        'French': 'Fr',
        'Science': '🔬',
        'Social Studies': '🌍',
        'Geology': '⛰',
        'Mechanics': '⚙',
        'Deutsch': 'De'
      };

      // Professional color mapping - Dark theme compatible
      const colorMap = {
        'Math': 'bg-slate-600 dark:bg-slate-700',
        'Mathematics': 'bg-slate-600 dark:bg-slate-700',
        'Physics': 'bg-blue-600 dark:bg-blue-700',
        'Chemistry': 'bg-indigo-600 dark:bg-indigo-700',
        'Biology': 'bg-emerald-600 dark:bg-emerald-700',
        'English': 'bg-purple-600 dark:bg-purple-700',
        'Arabic': 'bg-amber-600 dark:bg-amber-700',
        'French': 'bg-rose-600 dark:bg-rose-700',
        'Science': 'bg-green-600 dark:bg-green-700',
        'Social Studies': 'bg-orange-600 dark:bg-orange-700',
        'Geology': 'bg-stone-600 dark:bg-stone-700',
        'Mechanics': 'bg-gray-600 dark:bg-gray-700',
        'Deutsch': 'bg-cyan-600 dark:bg-cyan-700'
      };

      // Always include the subject, even if no topics/quizzes exist yet
      subjectsData.push({
        id: subject.toLowerCase().replace(/\s+/g, '-'),
        name: subject,
        icon: iconMap[subject] || '📖',
        color: colorMap[subject] || 'bg-gray-500',
        totalQuestions: subjectQuestions.length,
        totalQuizzes: subjectQuizzes.length,
        completedQuestions: Math.floor(subjectQuestions.length * 0.3), // Mock completion
        topics: allTopics
      });
    }

    // Mock user stats (in a real app, this would come from user progress tracking)
    const userStats = {
      totalQuestions: questions.length,
      correctAnswers: Math.floor(questions.length * 0.76),
      streak: 12,
      xp: 1520,
      level: 8,
      rank: 15,
      timeSpent: 3450,
      averageScore: 76.5
    };

    // Recent achievements (mock data)
    const recentAchievements = [
      { 
        id: 1, 
        title: 'Speed Demon', 
        description: 'Completed quiz in under 30 seconds', 
        icon: '⚡', 
        unlocked: '2 days ago' 
      },
      { 
        id: 2, 
        title: 'Perfect Score', 
        description: 'Got 100% on Physics quiz', 
        icon: '🎯', 
        unlocked: '1 week ago' 
      },
      { 
        id: 3, 
        title: 'Streak Master', 
        description: 'Maintained 10-day streak', 
        icon: '🔥', 
        unlocked: '2 weeks ago' 
      }
    ];

    res.json({
      success: true,
      data: {
        subjects: subjectsData,
        userStats,
        recentAchievements,
        totalSubjects: subjectsData.length,
        totalQuestions: questions.length
      }
    });

  } catch (error) {
    console.error("Error getting home page data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { subjectId, topicId } = req.params;
    
    // Check if this is a quiz ID (ObjectId format) or question-based topic
    const isQuizId = topicId.match(/^[0-9a-fA-F]{24}$/);
    
    if (isQuizId) {
      // Fetch quiz by ID
      const quiz = await Quiz.findById(topicId)
        .populate({
          path: 'questions',
          match: { deleted_at: null, published: true },
          select: 'title question_text description choices explanation difficulty points time_limit_seconds subject source'
        })
        .lean();

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: "Quiz not found"
        });
      }

      // Transform quiz questions to quiz format
      const quizQuestions = quiz.questions.map((q, index) => ({
        id: q._id,
        question: q.question_text || q.description || q.title,
        choices: q.choices && q.choices.length > 0 ? q.choices.map((choice, i) => ({
          id: String.fromCharCode(97 + i), // a, b, c, d
          text: choice.text || choice.choice_text || `Option ${i + 1}`,
          isCorrect: choice.is_correct || choice.correct || false
        })) : [
          { id: 'a', text: 'Option A', isCorrect: true },
          { id: 'b', text: 'Option B', isCorrect: false },
          { id: 'c', text: 'Option C', isCorrect: false },
          { id: 'd', text: 'Option D', isCorrect: false }
        ],
        explanation: q.explanation || "No explanation provided.",
        difficulty: q.difficulty || 'Medium',
        points: q.points || 10
      }));

      res.json({
        success: true,
        data: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          subject: subjectId.replace(/-/g, ' '),
          difficulty: quiz.questions[0]?.difficulty || 'Medium',
          estimatedTime: quiz.total_time || Math.max(1, quizQuestions.length * 2),
          questions: quizQuestions,
          type: 'quiz'
        }
      });
    } else {
      // Legacy question-based topic handling
      const subject = subjectId.replace(/-/g, ' ');
      const source = topicId.replace(/-/g, ' ');
      
      // Find questions for this topic
      const questions = await Question.find({ 
        deleted_at: null, 
        published: true,
        subject: { $regex: new RegExp(subject, 'i') },
        source: { $regex: new RegExp(source, 'i') }
      })
      .select('title question_text description choices explanation difficulty points time_limit_seconds subject source')
      .lean();

      if (questions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No questions found for this topic"
        });
      }

      // Transform questions to quiz format
      const quizQuestions = questions.map((q, index) => ({
        id: q._id,
        question: q.question_text || q.description || q.title,
        choices: q.choices && q.choices.length > 0 ? q.choices.map((choice, i) => ({
          id: String.fromCharCode(97 + i), // a, b, c, d
          text: choice.text || choice.choice_text || `Option ${i + 1}`,
          isCorrect: choice.is_correct || choice.correct || false
        })) : [
          { id: 'a', text: 'Option A', isCorrect: true },
          { id: 'b', text: 'Option B', isCorrect: false },
          { id: 'c', text: 'Option C', isCorrect: false },
          { id: 'd', text: 'Option D', isCorrect: false }
        ],
        explanation: q.explanation || "No explanation provided.",
        difficulty: q.difficulty || 'Medium',
        points: q.points || 10
      }));

      // Calculate estimated time (minimum 1 minute)
      const estimatedTime = Math.max(1, Math.min(90, quizQuestions.length * 2));

      res.json({
        success: true,
        data: {
          id: `${subjectId}-${topicId}`,
          title: source,
          subject: subject,
          difficulty: questions[0]?.difficulty || 'Medium',
          estimatedTime: estimatedTime,
          questions: quizQuestions,
          type: 'question-topic'
        }
      });
    }

  } catch (error) {
    console.error("Error getting quiz questions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};