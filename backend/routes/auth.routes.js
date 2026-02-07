import express from "express";
import mongoose from "mongoose";
import { registerUser, loginUser, getCurrentUser, updateCurrentUser } from "../controllers/auth.controller.js";
import { admin, protect } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";
import UserProgress from "../models/userProgress.model.js";
import Achievement from "../models/achievement.model.js";
import Streak from "../models/streak.model.js";

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
    
    // Daily activity for graphs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyActivity = (progress.daily_activity || [])
      .filter(d => new Date(d.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(d => ({
        date: d.date,
        questions: d.questions_answered,
        xp: d.xp_gained,
        timeSpent: d.time_spent
      }));

    // Recent quiz attempts for score trend (last 20)
    const recentQuizzes = (progress.quiz_attempts || [])
      .slice(-20)
      .map(qa => ({
        quizId: qa.quiz_id?.toString(),
        subject: qa.subject,
        score: qa.score,
        questionsCorrect: qa.questions_correct,
        questionsTotal: qa.questions_total,
        timeTaken: qa.time_taken,
        completedAt: qa.completed_at
      }));

    // Member since
    const user = await User.findById(userId).select('createdAt');

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
        completedQuizIds: (progress.quiz_attempts || []).map(qa => qa.quiz_id?.toString()).filter(Boolean),
        dailyActivity,
        recentQuizzes,
        memberSince: user?.createdAt
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

// ─── Admin User Management ────────────────────────────────────────────────────

// @desc    Get single user details (admin)
// @route   GET /api/auth/users/:id
router.get("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch user progress for stats
    const progress = await UserProgress.findOne({ user_id: user._id });
    const achievements = await Achievement.find({ user_id: user._id });

    res.json({
      user,
      stats: progress ? {
        totalQuestions: progress.total_questions_attempted || 0,
        correctAnswers: progress.total_questions_correct || 0,
        accuracy: progress.total_questions_attempted > 0
          ? Math.round((progress.total_questions_correct / progress.total_questions_attempted) * 100) : 0,
        totalXP: progress.total_xp || 0,
        level: progress.level || 1,
        currentStreak: progress.current_streak || 0,
        longestStreak: progress.longest_streak || 0,
        quizzesCompleted: progress.total_quizzes_completed || 0,
        lastActivity: progress.last_activity_date,
      } : null,
      achievementCount: achievements.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user role (admin)
// @route   PATCH /api/auth/users/:id/role
router.patch("/users/:id/role", protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "editor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be user, editor, or admin." });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user, message: `Role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle user active status (admin)
// @route   PATCH /api/auth/users/:id/status
router.patch("/users/:id/status", protect, admin, async (req, res) => {
  try {
    const { active } = req.body;
    if (typeof active !== "boolean") {
      return res.status(400).json({ message: "active must be a boolean" });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot deactivate your own account." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user, message: `User ${active ? "activated" : "deactivated"}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile (name, email, bio, department) by admin
// @route   PUT /api/auth/users/:id
router.put("/users/:id", protect, admin, async (req, res) => {
  try {
    const { name, email, bio, department } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check for email uniqueness if changing email
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already in use by another user." });
      user.email = email;
    }

    // Check for name uniqueness if changing name
    if (name && name !== user.name) {
      const existing = await User.findOne({ name });
      if (existing) return res.status(400).json({ message: "Name already in use by another user." });
      user.name = name;
    }

    if (bio !== undefined) user.bio = bio;
    if (department !== undefined) user.department = department;

    const updated = await user.save();
    const { password, ...userObj } = updated.toObject();

    res.json({ user: userObj, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a user (admin)
// @route   DELETE /api/auth/users/:id
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optionally clean up user-related data
    await UserProgress.deleteMany({ user_id: user._id });
    await Achievement.deleteMany({ user_id: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ message: `User "${user.name}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset user password (admin sets a new temporary password)
// @route   PATCH /api/auth/users/:id/reset-password
router.patch("/users/:id/reset-password", protect, admin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword; // bcrypt pre-save hook will hash it
    await user.save();

    res.json({ message: `Password reset for "${user.name}"` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset all user data (admin) - wipes progress, achievements, streaks, daily challenge attempts
// @route   POST /api/auth/users/:id/reset-data
router.post("/users/:id/reset-data", protect, admin, async (req, res) => {
  try {
    // Prevent admin from resetting their own data
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot reset your own data." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete UserProgress
    await UserProgress.deleteMany({ user_id: user._id });

    // Delete Achievements
    await Achievement.deleteMany({ user_id: user._id });

    // Delete Streak data
    await Streak.deleteMany({ user_id: user._id });

    // Delete DailyChallengeAttempt data
    const DailyChallengeAttempt = mongoose.models.DailyChallengeAttempt;
    if (DailyChallengeAttempt) {
      await DailyChallengeAttempt.deleteMany({ user: user._id });
    }

    // Reset user score
    user.score = 0;
    await user.save();

    res.json({ message: `All data reset for "${user.name}". Account is now fresh.` });
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