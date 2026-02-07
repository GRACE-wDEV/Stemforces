import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import UserProgress from "../models/userProgress.model.js";
import Achievement from "../models/achievement.model.js";

// Helper function to get real user stats
const getUserStats = async (userId) => {
  if (!userId) {
    // Return guest stats
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      xp: 0,
      level: 1,
      rank: 0,
      timeSpent: 0,
      averageScore: 0,
      isGuest: true
    };
  }

  try {
    const userProgress = await UserProgress.findOne({ user_id: userId });
    
    if (!userProgress) {
      // Create initial progress for new user
      const newProgress = await UserProgress.create({
        user_id: userId,
        total_questions_attempted: 0,
        total_questions_correct: 0,
        total_xp: 0,
        level: 1,
        current_streak: 0
      });
      
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        streak: 0,
        xp: 0,
        level: 1,
        rank: 0,
        timeSpent: 0,
        averageScore: 0,
        isGuest: false
      };
    }

    // Calculate level based on XP (100 XP per level – matches frontend levelUtils)
    const level = Math.floor(userProgress.total_xp / 100) + 1;
    
    // Calculate average score
    const averageScore = userProgress.total_questions_attempted > 0 
      ? Math.round((userProgress.total_questions_correct / userProgress.total_questions_attempted) * 100)
      : 0;

    // Get user rank (based on XP)
    const higherRankUsers = await UserProgress.countDocuments({
      total_xp: { $gt: userProgress.total_xp }
    });
    const rank = higherRankUsers + 1;

    return {
      totalQuestions: userProgress.total_questions_attempted,
      correctAnswers: userProgress.total_questions_correct,
      streak: userProgress.current_streak,
      xp: userProgress.total_xp,
      level: level,
      rank: rank,
      timeSpent: userProgress.total_time_spent,
      averageScore: averageScore,
      isGuest: false
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      totalQuestions: 0,
      correctAnswers: 0,
      streak: 0,
      xp: 0,
      level: 1,
      rank: 0,
      timeSpent: 0,
      averageScore: 0,
      isGuest: false
    };
  }
};

// Helper function to get recent achievements
const getRecentAchievements = async (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const achievements = await Achievement.find({ user_id: userId })
      .sort({ earned_at: -1 })
      .limit(5)
      .lean();

    return achievements.map(achievement => ({
      id: achievement._id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      unlocked: getTimeAgo(achievement.earned_at),
      isRare: achievement.is_rare,
      subject: achievement.subject
    }));
  } catch (error) {
    console.error("Error getting achievements:", error);
    return [];
  }
};

// Helper function to calculate completed questions per subject
const getSubjectProgress = async (userId, subjectQuestions) => {
  if (!userId || subjectQuestions.length === 0) {
    return 0;
  }

  try {
    const userProgress = await UserProgress.findOne({ user_id: userId });
    if (!userProgress) return 0;

    const subjectProgress = userProgress.subject_progress.find(
      sp => sp.subject.toLowerCase() === subjectQuestions[0].subject.toLowerCase()
    );

    return subjectProgress ? subjectProgress.questions_correct : 0;
  } catch (error) {
    console.error("Error getting subject progress:", error);
    return 0;
  }
};

// Helper function to format time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2419200)} months ago`;
};

export const getHomePageData = async (req, res) => {
  try {
    // Get user ID from request (if authenticated)
    const userId = req.user?._id;

    // Define all available subjects (always show these)
    const standardSubjects = [
      'Math',
      'Arabic', 
      'Physics',
      'Chemistry',
      'English',
      'Deutsch',
      'Earth Science',
      'French',
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

      // Get question-based topics (legacy approach) - only for sources without quizzes
      const sources = [...new Set(subjectQuestions.map(q => q.source))].filter(Boolean);
      
      // Get quiz sources to avoid duplicates
      const quizSources = new Set(subjectQuizzes.map(q => q.source).filter(Boolean));
      const quizTitles = new Set(subjectQuizzes.map(q => q.title));
      
      const questionTopics = sources
        // Filter out sources that already have quizzes (avoid duplication)
        .filter(source => !quizSources.has(source) && !quizTitles.has(source))
        .map(source => {
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

      // Get real subject progress for authenticated users
      const completedQuestions = await getSubjectProgress(userId, subjectQuestions);

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
        completedQuestions: completedQuestions, // Real progress data
        topics: allTopics
      });
    }

    // Get real user stats and achievements
    const userStats = await getUserStats(userId);
    const recentAchievements = await getRecentAchievements(userId);

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
        id: q._id.toString(),
        _id: q._id,
        question: q.question_text || q.description || q.title,
        question_text: q.question_text,
        choices: q.choices && q.choices.length > 0 ? q.choices.map((choice, i) => ({
          id: choice.id || choice._id?.toString() || String(i + 1),
          text: choice.text || choice.choice_text || `Option ${i + 1}`,
          is_correct: choice.is_correct || choice.correct || false,
          isCorrect: choice.is_correct || choice.correct || false
        })) : [
          { id: '1', text: 'Option A', is_correct: true, isCorrect: true },
          { id: '2', text: 'Option B', is_correct: false, isCorrect: false },
          { id: '3', text: 'Option C', is_correct: false, isCorrect: false },
          { id: '4', text: 'Option D', is_correct: false, isCorrect: false }
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
        id: q._id.toString(),
        _id: q._id,
        question: q.question_text || q.description || q.title,
        question_text: q.question_text,
        choices: q.choices && q.choices.length > 0 ? q.choices.map((choice, i) => ({
          id: choice.id || choice._id?.toString() || String(i + 1),
          text: choice.text || choice.choice_text || `Option ${i + 1}`,
          is_correct: choice.is_correct || choice.correct || false,
          isCorrect: choice.is_correct || choice.correct || false
        })) : [
          { id: '1', text: 'Option A', is_correct: true, isCorrect: true },
          { id: '2', text: 'Option B', is_correct: false, isCorrect: false },
          { id: '3', text: 'Option C', is_correct: false, isCorrect: false },
          { id: '4', text: 'Option D', is_correct: false, isCorrect: false }
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