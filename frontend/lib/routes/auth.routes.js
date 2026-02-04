import express from "express";
import { registerUser, loginUser, getCurrentUser, updateCurrentUser } from "../controllers/auth.controller.js";
import { admin, protect } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";
import UserProgress from "../models/userProgress.model.js";
import Achievement from "../models/achievement.model.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateCurrentUser);

// Get comprehensive user stats
router.get("/me/stats", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgress.findOne({ user_id: userId });
    const achievements = await Achievement.find({ user_id: userId });
    
    if (!progress) {
      return res.json({
        success: true,
        data: {
          totalQuestions: 0,
          correctAnswers: 0,
          accuracy: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalXP: 0,
          level: 1,
          quizzesCompleted: 0,
          totalTimeSpent: 0,
          subjectProgress: [],
          recentBadges: [],
          completedQuizIds: []
        }
      });
    }
    
    // Calculate accuracy
    const accuracy = progress.total_questions_attempted > 0
      ? Math.round((progress.total_questions_correct / progress.total_questions_attempted) * 100)
      : 0;
    
    // Get recent badges (last 5)
    const recentBadges = achievements.slice(-5).reverse().map(a => ({
      id: a.achievement_type,
      title: a.title,
      icon: a.icon,
      earnedAt: a.earned_at
    }));
    
    res.json({
      success: true,
      data: {
        totalQuestions: progress.total_questions_attempted,
        correctAnswers: progress.total_questions_correct,
        accuracy,
        currentStreak: progress.current_streak,
        longestStreak: progress.longest_streak,
        totalXP: progress.total_xp,
        level: progress.level,
        quizzesCompleted: progress.total_quizzes_completed,
        totalTimeSpent: progress.total_time_spent,
        subjectProgress: progress.subject_progress || [],
        recentBadges,
        lastActivity: progress.last_activity_date,
        completedQuizIds: (progress.quiz_attempts || []).map(qa => qa.quiz_id?.toString()).filter(Boolean)
      }
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/me/activities", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await UserProgress.findOne({ user_id: userId }).populate('quiz_attempts.quiz_id', 'title');
    const achievements = await Achievement.find({ user_id: userId }).sort({ earned_at: -1 }).limit(20);

    const activities = [];

    if (progress && Array.isArray(progress.quiz_attempts)) {
      // take last 20 attempts
      const recentAttempts = progress.quiz_attempts.slice(-20).reverse();
      recentAttempts.forEach((qa) => {
        activities.push({
          type: 'quiz',
          title: `Completed ${qa.subject} Quiz`,
          subtitle: `${qa.score}% — ${qa.questions_correct}/${qa.questions_total} correct`,
          time: qa.completed_at,
          meta: { quizId: qa.quiz_id?._id, quizTitle: qa.quiz_id?.title }
        });
      });
    }

    achievements.forEach((a) => {
      activities.push({
        type: 'achievement',
        title: a.title,
        subtitle: a.description,
        time: a.earned_at,
        icon: a.icon,
        xp: a.xp_reward
      });
    });

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ activities: activities.slice(0, 20) });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: error.message });
  }
});
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user's Gemini API key
router.put("/me/api-key", protect, async (req, res) => {
  try {
    const { apiKey } = req.body;
    const userId = req.user.id;
    
    // Update the user's API key
    await User.findByIdAndUpdate(userId, { geminiApiKey: apiKey || null });
    
    res.json({
      success: true,
      message: apiKey ? 'API key saved successfully' : 'API key removed'
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if user has API key configured
router.get("/me/api-key/status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+geminiApiKey');
    
    res.json({
      success: true,
      hasApiKey: !!user?.geminiApiKey
    });
  } catch (error) {
    console.error("Error checking API key:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;