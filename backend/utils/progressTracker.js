import UserProgress from "../models/userProgress.model.js";
import Achievement from "../models/achievement.model.js";

// XP rewards system
const XP_REWARDS = {
  CORRECT_ANSWER: 10,
  PERFECT_QUIZ: 50,
  FAST_COMPLETION: 25,
  STREAK_BONUS: 20,
  FIRST_QUIZ: 100
};

// Update user progress after quiz completion
export const updateUserProgress = async (userId, quizResult) => {
  try {
    const {
      subject,
      questionsCorrect,
      questionsTotal,
      timeTaken,
      quizId,
      isFirstQuiz = false
    } = quizResult;

    // Find or create user progress
    let userProgress = await UserProgress.findOne({ user_id: userId });
    
    if (!userProgress) {
      userProgress = new UserProgress({
        user_id: userId,
        total_questions_attempted: 0,
        total_questions_correct: 0,
        total_quizzes_completed: 0,
        total_time_spent: 0,
        current_streak: 0,
        total_xp: 0,
        level: 1,
        subject_progress: [],
        quiz_attempts: [],
        daily_activity: []
      });
    }

    // Calculate score percentage
    const scorePercentage = Math.round((questionsCorrect / questionsTotal) * 100);
    
    // Calculate XP earned
    let xpEarned = questionsCorrect * XP_REWARDS.CORRECT_ANSWER;
    
    // Bonus XP for perfect score
    if (questionsCorrect === questionsTotal) {
      xpEarned += XP_REWARDS.PERFECT_QUIZ;
    }
    
    // Bonus XP for fast completion (if completed in less than 1 minute per question)
    const avgTimePerQuestion = timeTaken / questionsTotal;
    if (avgTimePerQuestion < 1) {
      xpEarned += XP_REWARDS.FAST_COMPLETION;
    }
    
    // First quiz bonus
    if (isFirstQuiz) {
      xpEarned += XP_REWARDS.FIRST_QUIZ;
    }

    // Update overall stats
    userProgress.total_questions_attempted += questionsTotal;
    userProgress.total_questions_correct += questionsCorrect;
    userProgress.total_quizzes_completed += 1;
    userProgress.total_time_spent += timeTaken;
    userProgress.total_xp += xpEarned;
    userProgress.level = Math.floor(userProgress.total_xp / 200) + 1;
    
    // Update streak
    const today = new Date();
    const lastActivity = userProgress.last_activity_date;
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day - continue streak
      userProgress.current_streak += 1;
      xpEarned += XP_REWARDS.STREAK_BONUS;
    } else if (daysDiff === 0) {
      // Same day - maintain streak
    } else {
      // Streak broken - reset
      userProgress.current_streak = 1;
    }
    
    userProgress.last_activity_date = today;

    // Update subject progress
    let subjectProgress = userProgress.subject_progress.find(sp => sp.subject === subject);
    if (!subjectProgress) {
      subjectProgress = {
        subject,
        questions_attempted: 0,
        questions_correct: 0,
        quizzes_completed: 0,
        time_spent: 0,
        best_score: 0,
        average_score: 0
      };
      userProgress.subject_progress.push(subjectProgress);
    }
    
    subjectProgress.questions_attempted += questionsTotal;
    subjectProgress.questions_correct += questionsCorrect;
    subjectProgress.quizzes_completed += 1;
    subjectProgress.time_spent += timeTaken;
    subjectProgress.best_score = Math.max(subjectProgress.best_score, scorePercentage);
    subjectProgress.average_score = Math.round(
      (subjectProgress.questions_correct / subjectProgress.questions_attempted) * 100
    );

    // Add quiz attempt to history
    userProgress.quiz_attempts.push({
      quiz_id: quizId,
      subject,
      score: scorePercentage,
      time_taken: timeTaken,
      questions_correct: questionsCorrect,
      questions_total: questionsTotal,
      completed_at: today
    });

    // Update daily activity
    const todayStr = today.toDateString();
    let dailyActivity = userProgress.daily_activity.find(
      da => da.date.toDateString() === todayStr
    );
    
    if (!dailyActivity) {
      dailyActivity = {
        date: today,
        questions_answered: 0,
        time_spent: 0,
        xp_gained: 0
      };
      userProgress.daily_activity.push(dailyActivity);
    }
    
    dailyActivity.questions_answered += questionsTotal;
    dailyActivity.time_spent += timeTaken;
    dailyActivity.xp_gained += xpEarned;

    await userProgress.save();

    // Check and award achievements
    await checkAndAwardAchievements(userId, userProgress, quizResult);

    return {
      xpEarned,
      newLevel: userProgress.level,
      currentStreak: userProgress.current_streak,
      totalXP: userProgress.total_xp
    };

  } catch (error) {
    console.error("Error updating user progress:", error);
    throw error;
  }
};

// Check and award achievements
export const checkAndAwardAchievements = async (userId, userProgress, quizResult) => {
  const achievements = [];

  try {
    const { subject, questionsCorrect, questionsTotal, timeTaken } = quizResult;
    const scorePercentage = Math.round((questionsCorrect / questionsTotal) * 100);

    // First Quiz Achievement
    if (userProgress.total_quizzes_completed === 1) {
      achievements.push({
        achievement_type: 'first_quiz',
        title: 'First Steps',
        description: 'Completed your first quiz!',
        icon: '🎯',
        xp_reward: 50
      });
    }

    // Perfect Score Achievement
    if (scorePercentage === 100) {
      achievements.push({
        achievement_type: 'perfect_score',
        title: 'Perfect Score',
        description: `Got 100% on ${subject} quiz!`,
        icon: '🎯',
        subject: subject,
        value: 100,
        xp_reward: 75
      });
    }

    // Speed Demon Achievement (less than 30 seconds per question)
    const avgTimePerQuestion = (timeTaken * 60) / questionsTotal; // Convert to seconds
    if (avgTimePerQuestion < 30) {
      achievements.push({
        achievement_type: 'speed_demon',
        title: 'Speed Demon',
        description: `Completed quiz in under 30 seconds per question!`,
        icon: '⚡',
        value: Math.round(avgTimePerQuestion),
        xp_reward: 60
      });
    }

    // Streak Master Achievements
    if (userProgress.current_streak === 5) {
      achievements.push({
        achievement_type: 'streak_master',
        title: 'Streak Master',
        description: 'Maintained a 5-day learning streak!',
        icon: '🔥',
        value: 5,
        xp_reward: 100
      });
    } else if (userProgress.current_streak === 10) {
      achievements.push({
        achievement_type: 'streak_master',
        title: 'Dedication Master',
        description: 'Maintained a 10-day learning streak!',
        icon: '🔥',
        value: 10,
        is_rare: true,
        xp_reward: 200
      });
    }

    // Subject Expert Achievement (100+ questions in one subject)
    const subjectProgress = userProgress.subject_progress.find(sp => sp.subject === subject);
    if (subjectProgress && subjectProgress.questions_correct >= 100) {
      const existingAchievement = await Achievement.findOne({
        user_id: userId,
        achievement_type: 'subject_expert',
        subject: subject
      });
      
      if (!existingAchievement) {
        achievements.push({
          achievement_type: 'subject_expert',
          title: `${subject} Expert`,
          description: `Correctly answered 100+ questions in ${subject}!`,
          icon: '🧠',
          subject: subject,
          value: subjectProgress.questions_correct,
          is_rare: true,
          xp_reward: 150
        });
      }
    }

    // Quiz Champion Achievement (50+ quizzes completed)
    if (userProgress.total_quizzes_completed >= 50) {
      const existingAchievement = await Achievement.findOne({
        user_id: userId,
        achievement_type: 'quiz_champion'
      });
      
      if (!existingAchievement) {
        achievements.push({
          achievement_type: 'quiz_champion',
          title: 'Quiz Champion',
          description: 'Completed 50+ quizzes!',
          icon: '🏆',
          value: userProgress.total_quizzes_completed,
          is_rare: true,
          xp_reward: 250
        });
      }
    }

    // Save all new achievements
    for (const achievement of achievements) {
      await Achievement.create({
        user_id: userId,
        ...achievement
      });
      
      // Add XP reward to user
      userProgress.total_xp += achievement.xp_reward;
    }

    if (achievements.length > 0) {
      await userProgress.save();
    }

    return achievements;

  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
};