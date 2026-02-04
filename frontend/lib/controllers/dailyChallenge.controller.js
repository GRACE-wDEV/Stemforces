import mongoose from "mongoose";
import DailyChallenge from "../models/dailyChallenge.model.js";
import Question from "../models/question.model.js";
import UserProgress from "../models/userProgress.model.js";
import Achievement from "../models/achievement.model.js";
import Streak from "../models/streak.model.js";

// DailyChallengeAttempt model (must be defined before use)
const dailyChallengeAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: "DailyChallenge", required: true },
  score: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, answer: String, isCorrect: Boolean }],
  xpEarned: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

dailyChallengeAttemptSchema.index({ user: 1, challenge: 1 }, { unique: true });
dailyChallengeAttemptSchema.index({ challenge: 1, score: -1 });

// Prevent model recompilation in hot-reload
const DailyChallengeAttempt = mongoose.models.DailyChallengeAttempt || 
  mongoose.model("DailyChallengeAttempt", dailyChallengeAttemptSchema);

// Get today's daily challenge
export const getTodayChallenge = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let challenge = await DailyChallenge.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      active: true
    }).populate('questions', 'title question_text subject difficulty options choices correctAnswer points explanation');
    
    // If no challenge exists for today, generate one
    if (!challenge) {
      challenge = await generateDailyChallenge(today);
    }
    
    // Check if user already completed
    let userAttempt = null;
    if (req.user) {
      userAttempt = await DailyChallengeAttempt.findOne({
        user: req.user._id,
        challenge: challenge._id
      });
    }
    
    // Prepare response (hide correct answers if not completed)
    const responseData = {
      id: challenge._id,
      date: challenge.date,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      timeLimit: challenge.timeLimit,
      baseXP: challenge.baseXP,
      bonusXP: challenge.bonusXP,
      modifiers: challenge.modifiers,
      subject: challenge.subject,
      questionsCount: challenge.questions.length,
      stats: {
        totalParticipants: challenge.totalParticipants,
        averageScore: challenge.averageScore,
        perfectScores: challenge.perfectScores
      },
      completed: !!userAttempt,
      userScore: userAttempt?.score || null,
      userRank: userAttempt?.rank || null
    };
    
    // Include questions only if not completed or for first attempt
    if (!userAttempt) {
      responseData.questions = challenge.questions.map((q, index) => {
        // Handle both choices (with is_correct) and options (with correctAnswer) formats
        let options = [];
        let correctIdx = null;
        
        if (q.choices && q.choices.length > 0) {
          // New format: choices array with is_correct
          options = q.choices.map((c, i) => ({
            id: c.id || c._id?.toString() || String(i),
            text: c.text,
            isCorrect: c.is_correct
          }));
          correctIdx = q.choices.findIndex(c => c.is_correct);
        } else if (q.options && q.options.length > 0) {
          // Legacy format: options array with correctAnswer
          options = q.options.map((opt, i) => ({
            id: String(i),
            text: typeof opt === 'string' ? opt : opt.text,
            isCorrect: q.correctAnswer === (typeof opt === 'string' ? opt : opt.text) || q.correctAnswer === String(i)
          }));
          correctIdx = options.findIndex(o => o.isCorrect);
        }
        
        return {
          id: q._id,
          _id: q._id,
          index: index + 1,
          title: q.title,
          question: q.question_text || q.title,
          subject: q.subject,
          difficulty: q.difficulty,
          points: q.points || 10,
          options,
          correct: correctIdx,
          explanation: q.explanation
        };
      });
    }
    
    res.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error("Error getting daily challenge:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get daily challenge"
    });
  }
};

// Generate a daily challenge automatically
const generateDailyChallenge = async (date) => {
  const dayOfWeek = date.getDay();
  
  // Themed days
  const themes = {
    0: { subject: null, difficulty: 'mixed', title: 'Sunday Funday Mix' },
    1: { subject: 'Math', difficulty: 'medium', title: 'Math Monday' },
    2: { subject: 'Physics', difficulty: 'medium', title: 'Physics Tuesday' },
    3: { subject: 'Chemistry', difficulty: 'hard', title: 'Chemistry Wednesday' },
    4: { subject: 'Biology', difficulty: 'medium', title: 'Bio Thursday' },
    5: { subject: null, difficulty: 'hard', title: 'Fearless Friday Challenge' },
    6: { subject: null, difficulty: 'extreme', title: 'Saturday Showdown' }
  };
  
  const theme = themes[dayOfWeek];
  console.log(`[Daily Challenge] Generating for ${date.toISOString()} - Day: ${dayOfWeek} - Theme: ${theme.title}`);
  
  // Build question query - try theme-specific first, fall back to any published
  let query = { published: true, deleted_at: null };
  if (theme.subject) {
    query.subject = { $regex: new RegExp(theme.subject, 'i') };
  }
  if (theme.difficulty !== 'mixed' && theme.difficulty !== 'extreme') {
    query.difficulty = theme.difficulty;
  }
  
  // Get random questions
  let questions = await Question.aggregate([
    { $match: query },
    { $sample: { size: 10 } }
  ]);
  
  // If not enough questions with filters, try without difficulty filter
  if (questions.length < 5) {
    console.log(`[Daily Challenge] Only ${questions.length} questions found with difficulty filter, trying without...`);
    const fallbackQuery = { published: true, deleted_at: null };
    if (theme.subject) {
      fallbackQuery.subject = { $regex: new RegExp(theme.subject, 'i') };
    }
    questions = await Question.aggregate([
      { $match: fallbackQuery },
      { $sample: { size: 10 } }
    ]);
  }
  
  // If still not enough, get any published questions
  if (questions.length < 5) {
    console.log(`[Daily Challenge] Still only ${questions.length} questions, falling back to any subject...`);
    questions = await Question.aggregate([
      { $match: { published: true, deleted_at: null } },
      { $sample: { size: 10 } }
    ]);
  }
  
  console.log(`[Daily Challenge] Found ${questions.length} questions`);
  
  if (questions.length === 0) {
    throw new Error('No questions available for daily challenge');
  }
  
  // Calculate rewards based on difficulty
  const rewards = {
    easy: { base: 50, bonus: 25 },
    medium: { base: 100, bonus: 50 },
    hard: { base: 150, bonus: 100 },
    extreme: { base: 250, bonus: 150 },
    mixed: { base: 100, bonus: 75 }
  };
  
  const reward = rewards[theme.difficulty] || rewards.medium;
  
  // Use findOneAndUpdate with upsert to handle race conditions
  const challenge = await DailyChallenge.findOneAndUpdate(
    { 
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    },
    {
      $setOnInsert: {
        date,
        title: theme.title,
        description: `Complete today's ${theme.difficulty} challenge to earn bonus XP and maintain your streak!`,
        questions: questions.map(q => q._id),
        difficulty: theme.difficulty === 'extreme' ? 'hard' : (theme.difficulty === 'mixed' ? 'medium' : theme.difficulty),
        timeLimit: theme.difficulty === 'extreme' ? 10 : 15,
        baseXP: reward.base,
        bonusXP: reward.bonus,
        subject: theme.subject,
        active: true,
        modifiers: {
          noHints: theme.difficulty === 'extreme',
          speedBonus: true,
          perfectBonus: true
        }
      }
    },
    { upsert: true, new: true }
  );
  
  console.log(`[Daily Challenge] Created/found challenge: ${challenge._id} - ${challenge.title}`);
  
  return challenge.populate('questions', 'title question_text subject difficulty options choices correctAnswer points explanation');
};

// Submit daily challenge attempt
export const submitDailyChallenge = async (req, res) => {
  try {
    const { challengeId, answers, timeTaken } = req.body;
    const userId = req.user._id;
    
    const challenge = await DailyChallenge.findById(challengeId)
      .populate('questions');
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: "Challenge not found"
      });
    }
    
    // Check if already completed
    const existingAttempt = await DailyChallengeAttempt.findOne({
      user: userId,
      challenge: challengeId
    });
    
    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: "You have already completed today's challenge"
      });
    }
    
    // Calculate score
    let correctAnswers = 0;
    const questionResults = [];
    
    challenge.questions.forEach((question, index) => {
      const userAnswer = answers[question._id.toString()];
      
      // Handle both choices format (is_correct) and correctAnswer format
      let isCorrect = false;
      let correctAnswerValue = null;
      
      if (question.choices && question.choices.length > 0) {
        // New format: choices array with is_correct
        const correctIndex = question.choices.findIndex(c => c.is_correct);
        isCorrect = userAnswer === correctIndex;
        correctAnswerValue = correctIndex;
      } else if (question.correctAnswer !== undefined) {
        // Legacy format: correctAnswer field
        isCorrect = userAnswer === question.correctAnswer || 
                   String(userAnswer) === String(question.correctAnswer);
        correctAnswerValue = question.correctAnswer;
      }
      
      if (isCorrect) correctAnswers++;
      
      questionResults.push({
        questionId: question._id,
        userAnswer,
        correctAnswer: correctAnswerValue,
        isCorrect,
        points: isCorrect ? (question.points || 10) : 0
      });
    });
    
    const score = Math.round((correctAnswers / challenge.questions.length) * 100);
    const isPerfect = score === 100;
    
    // Calculate XP with modifiers
    let xpEarned = Math.round(challenge.baseXP * (score / 100));
    
    // Perfect score bonus
    if (isPerfect && challenge.modifiers.perfectBonus) {
      xpEarned += challenge.bonusXP;
    }
    
    // Speed bonus (if completed in less than half the time)
    const halfTime = (challenge.timeLimit * 60) / 2;
    if (timeTaken < halfTime && challenge.modifiers.speedBonus) {
      xpEarned = Math.round(xpEarned * 1.25);
    }
    
    // Get streak multiplier
    let streak = await Streak.findOne({ user_id: userId });
    if (!streak) {
      streak = await Streak.create({ user_id: userId });
    }
    
    const streakResult = await streak.updateStreak();
    if (challenge.streakMultiplier) {
      xpEarned = Math.round(xpEarned * streakResult.multiplier);
    }
    
    // Update challenge stats
    const totalScore = challenge.averageScore * challenge.totalParticipants + score;
    challenge.totalParticipants += 1;
    challenge.averageScore = Math.round(totalScore / challenge.totalParticipants);
    if (isPerfect) challenge.perfectScores += 1;
    await challenge.save();
    
    // Update user progress
    await UserProgress.findOneAndUpdate(
      { user_id: userId },
      {
        $inc: {
          total_xp: xpEarned,
          total_questions_attempted: challenge.questions.length,
          total_questions_correct: correctAnswers
        },
        $set: {
          current_streak: streakResult.streak,
          last_activity_date: new Date()
        }
      },
      { upsert: true }
    );
    
    // Check for achievements
    const achievements = [];
    
    if (isPerfect) {
      const existingPerfect = await Achievement.findOne({
        user_id: userId,
        achievement_type: 'daily_perfect'
      });
      
      if (!existingPerfect) {
        const achievement = await Achievement.create({
          user_id: userId,
          achievement_type: 'perfect_score',
          title: 'Daily Perfection',
          description: 'Got a perfect score on a daily challenge',
          icon: '🎯',
          xp_reward: 100
        });
        achievements.push(achievement);
        xpEarned += 100;
      }
    }
    
    // Streak achievements
    if (streakResult.newMilestones && streakResult.newMilestones.length > 0) {
      for (const milestone of streakResult.newMilestones) {
        const achievement = await Achievement.create({
          user_id: userId,
          achievement_type: 'streak_master',
          title: `${milestone.days} Day Streak!`,
          description: `Maintained a ${milestone.days} day learning streak`,
          icon: '🔥',
          value: milestone.days,
          xp_reward: milestone.reward.xp
        });
        achievements.push(achievement);
        xpEarned += milestone.reward.xp;
      }
    }
    
    res.json({
      success: true,
      data: {
        score,
        correctAnswers,
        totalQuestions: challenge.questions.length,
        xpEarned,
        isPerfect,
        timeTaken,
        streak: streakResult.streak,
        multiplier: streakResult.multiplier,
        achievements,
        questionResults,
        rank: challenge.totalParticipants // Simple rank for now
      }
    });
    
  } catch (error) {
    console.error("Error submitting daily challenge:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit challenge"
    });
  }
};

// Get daily challenge leaderboard
export const getDailyChallengeLeaderboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const challenge = await DailyChallenge.findOne({
      date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });
    
    if (!challenge) {
      return res.json({
        success: true,
        data: { leaderboard: [], challenge: null }
      });
    }
    
    const attempts = await DailyChallengeAttempt.find({ challenge: challenge._id })
      .populate('user', 'name avatar')
      .sort({ score: -1, timeTaken: 1 })
      .limit(50);
    
    const leaderboard = attempts.map((attempt, index) => ({
      rank: index + 1,
      user: {
        id: attempt.user._id,
        name: attempt.user.name,
        avatar: attempt.user.avatar
      },
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      isPerfect: attempt.score === 100
    }));
    
    res.json({
      success: true,
      data: {
        challenge: {
          id: challenge._id,
          title: challenge.title,
          totalParticipants: challenge.totalParticipants
        },
        leaderboard
      }
    });
    
  } catch (error) {
    console.error("Error getting daily leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get leaderboard"
    });
  }
};

// Get user's streak info
export const getUserStreak = async (req, res) => {
  try {
    const userId = req.user._id;
    
    let streak = await Streak.findOne({ user_id: userId });
    
    if (!streak) {
      streak = await Streak.create({ user_id: userId });
    }
    
    // Get weekly activity
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyActivity = streak.weeklyActivity
      .filter(a => new Date(a.date) >= weekAgo)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Fill in missing days
    const filledWeek = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const activity = weeklyActivity.find(a => 
        new Date(a.date).toDateString() === date.toDateString()
      );
      
      filledWeek.push({
        date: date.toISOString(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        active: !!activity,
        questionsAnswered: activity?.questionsAnswered || 0,
        xpEarned: activity?.xpEarned || 0
      });
    }
    
    res.json({
      success: true,
      data: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        multiplier: streak.currentMultiplier,
        freezesAvailable: streak.freezesAvailable,
        isActiveToday: streak.isActiveToday(),
        weeklyActivity: filledWeek,
        milestones: streak.milestones.map(m => ({
          days: m.days,
          reachedAt: m.reachedAt,
          badge: m.reward.badge
        })),
        nextMilestone: getNextMilestone(streak.currentStreak)
      }
    });
    
  } catch (error) {
    console.error("Error getting streak:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get streak info"
    });
  }
};

// Helper to get next milestone
const getNextMilestone = (currentStreak) => {
  const milestones = [3, 7, 14, 30, 60, 100, 365];
  for (const m of milestones) {
    if (currentStreak < m) {
      return { days: m, remaining: m - currentStreak };
    }
  }
  return null;
};

// Regenerate today's challenge with new questions (Admin only)
export const regenerateTodayChallenge = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Delete existing challenge for today
    await DailyChallenge.deleteMany({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Also delete any attempts for today's challenge
    await DailyChallengeAttempt.deleteMany({
      completedAt: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // Generate new challenge
    const challenge = await generateDailyChallenge(today);
    
    res.json({
      success: true,
      message: 'Daily challenge regenerated with new questions',
      data: {
        id: challenge._id,
        title: challenge.title,
        questionsCount: challenge.questions.length
      }
    });
  } catch (error) {
    console.error("Error regenerating daily challenge:", error);
    res.status(500).json({
      success: false,
      message: "Failed to regenerate daily challenge"
    });
  }
};
