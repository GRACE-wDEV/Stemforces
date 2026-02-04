import Achievement from "../models/achievement.model.js";
import UserProgress from "../models/userProgress.model.js";

// Badge definitions with stunning icons
export const BADGE_DEFINITIONS = {
  // Streak badges
  streak_starter: {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Maintained a 3-day learning streak',
    icon: '🔥',
    color: 'from-orange-400 to-red-500',
    rarity: 'common',
    xp: 50
  },
  week_warrior: {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: '7 days of consistent learning',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
    rarity: 'uncommon',
    xp: 100
  },
  fortnight_fighter: {
    id: 'fortnight_fighter',
    title: 'Fortnight Fighter',
    description: '14 days streak - unstoppable!',
    icon: '💪',
    color: 'from-blue-400 to-purple-500',
    rarity: 'rare',
    xp: 200
  },
  monthly_master: {
    id: 'monthly_master',
    title: 'Monthly Master',
    description: '30 days of dedication',
    icon: '👑',
    color: 'from-purple-400 to-pink-500',
    rarity: 'epic',
    xp: 500
  },
  century_champion: {
    id: 'century_champion',
    title: 'Century Champion',
    description: '100 days streak - legendary!',
    icon: '🏆',
    color: 'from-yellow-300 to-yellow-600',
    rarity: 'legendary',
    xp: 2000
  },
  
  // Performance badges
  first_quiz: {
    id: 'first_quiz',
    title: 'First Steps',
    description: 'Completed your first quiz',
    icon: '🎯',
    color: 'from-green-400 to-emerald-500',
    rarity: 'common',
    xp: 25
  },
  perfect_score: {
    id: 'perfect_score',
    title: 'Perfectionist',
    description: 'Got 100% on a quiz',
    icon: '✨',
    color: 'from-yellow-400 to-amber-500',
    rarity: 'uncommon',
    xp: 75
  },
  speed_demon: {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completed a quiz in under 2 minutes',
    icon: '⚡',
    color: 'from-cyan-400 to-blue-500',
    rarity: 'rare',
    xp: 100
  },
  marathon_runner: {
    id: 'marathon_runner',
    title: 'Marathon Runner',
    description: 'Completed 50 quizzes',
    icon: '🏃',
    color: 'from-indigo-400 to-purple-500',
    rarity: 'epic',
    xp: 300
  },
  
  // Subject mastery badges
  math_master: {
    id: 'math_master',
    title: 'Math Master',
    description: 'Answered 100 Math questions correctly',
    icon: '🔢',
    color: 'from-blue-400 to-indigo-500',
    rarity: 'rare',
    xp: 150
  },
  physics_pro: {
    id: 'physics_pro',
    title: 'Physics Pro',
    description: 'Answered 100 Physics questions correctly',
    icon: '⚛️',
    color: 'from-purple-400 to-pink-500',
    rarity: 'rare',
    xp: 150
  },
  chemistry_champion: {
    id: 'chemistry_champion',
    title: 'Chemistry Champion',
    description: 'Answered 100 Chemistry questions correctly',
    icon: '🧪',
    color: 'from-green-400 to-teal-500',
    rarity: 'rare',
    xp: 150
  },
  biology_boss: {
    id: 'biology_boss',
    title: 'Biology Boss',
    description: 'Answered 100 Biology questions correctly',
    icon: '🧬',
    color: 'from-emerald-400 to-green-500',
    rarity: 'rare',
    xp: 150
  },
  
  // Battle badges
  battle_victor: {
    id: 'battle_victor',
    title: 'Battle Victor',
    description: 'Won your first quiz battle',
    icon: '⚔️',
    color: 'from-red-400 to-orange-500',
    rarity: 'uncommon',
    xp: 50
  },
  battle_legend: {
    id: 'battle_legend',
    title: 'Battle Legend',
    description: 'Won 10 quiz battles',
    icon: '🗡️',
    color: 'from-amber-400 to-red-500',
    rarity: 'epic',
    xp: 250
  },
  
  // Special badges
  early_bird: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Completed a quiz before 7 AM',
    icon: '🌅',
    color: 'from-orange-300 to-yellow-400',
    rarity: 'uncommon',
    xp: 30
  },
  night_owl: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Completed a quiz after 11 PM',
    icon: '🦉',
    color: 'from-indigo-500 to-purple-600',
    rarity: 'uncommon',
    xp: 30
  },
  daily_devotee: {
    id: 'daily_devotee',
    title: 'Daily Devotee',
    description: 'Completed 7 daily challenges in a row',
    icon: '📅',
    color: 'from-teal-400 to-cyan-500',
    rarity: 'rare',
    xp: 150
  }
};

// Get all badges for a user
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's earned achievements
    const earnedAchievements = await Achievement.find({ user_id: userId })
      .sort({ earned_at: -1 });
    
    // Map to badge IDs
    const earnedBadgeTypes = earnedAchievements.map(a => a.achievement_type);
    
    // Build response with all badges
    const allBadges = Object.values(BADGE_DEFINITIONS).map(badge => {
      const earned = earnedAchievements.find(a => 
        a.achievement_type === badge.id || a.icon === badge.icon
      );
      
      return {
        ...badge,
        earned: !!earned,
        earnedAt: earned?.earned_at || null,
        progress: null // Could calculate progress toward badge
      };
    });
    
    // Separate earned and locked
    const earned = allBadges.filter(b => b.earned);
    const locked = allBadges.filter(b => !b.earned);
    
    // Calculate stats
    const stats = {
      total: allBadges.length,
      earned: earned.length,
      percentage: Math.round((earned.length / allBadges.length) * 100),
      byRarity: {
        common: earned.filter(b => b.rarity === 'common').length,
        uncommon: earned.filter(b => b.rarity === 'uncommon').length,
        rare: earned.filter(b => b.rarity === 'rare').length,
        epic: earned.filter(b => b.rarity === 'epic').length,
        legendary: earned.filter(b => b.rarity === 'legendary').length
      }
    };
    
    res.json({
      success: true,
      data: {
        earned,
        locked,
        stats,
        recentlyEarned: earned.slice(0, 5)
      }
    });
    
  } catch (error) {
    console.error("Error getting badges:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get badges"
    });
  }
};

// Check and award badges after an action
export const checkAndAwardBadges = async (userId, context) => {
  const { 
    quizCompleted, 
    score, 
    timeTaken, 
    subject,
    isBattle,
    won,
    streak
  } = context;
  
  const awardedBadges = [];
  
  try {
    const progress = await UserProgress.findOne({ user_id: userId });
    if (!progress) return awardedBadges;
    
    const existingAchievements = await Achievement.find({ user_id: userId });
    const earnedTypes = existingAchievements.map(a => a.achievement_type);
    
    // First quiz badge
    if (quizCompleted && progress.total_quizzes_completed === 1 && !earnedTypes.includes('first_quiz')) {
      const badge = await awardBadge(userId, 'first_quiz');
      if (badge) awardedBadges.push(badge);
    }
    
    // Perfect score badge
    if (score === 100 && !earnedTypes.includes('perfect_score')) {
      const badge = await awardBadge(userId, 'perfect_score');
      if (badge) awardedBadges.push(badge);
    }
    
    // Speed demon badge (under 2 minutes for 10 questions)
    if (timeTaken < 120 && score >= 70 && !earnedTypes.includes('speed_demon')) {
      const badge = await awardBadge(userId, 'speed_demon');
      if (badge) awardedBadges.push(badge);
    }
    
    // Marathon runner badge
    if (progress.total_quizzes_completed >= 50 && !earnedTypes.includes('marathon_runner')) {
      const badge = await awardBadge(userId, 'marathon_runner');
      if (badge) awardedBadges.push(badge);
    }
    
    // Subject mastery badges
    const subjectProgress = progress.subject_progress?.find(sp => sp.subject === subject);
    if (subjectProgress && subjectProgress.questions_correct >= 100) {
      const subjectBadgeMap = {
        'Math': 'math_master',
        'Physics': 'physics_pro',
        'Chemistry': 'chemistry_champion',
        'Biology': 'biology_boss'
      };
      
      const badgeId = subjectBadgeMap[subject];
      if (badgeId && !earnedTypes.includes(badgeId)) {
        const badge = await awardBadge(userId, badgeId);
        if (badge) awardedBadges.push(badge);
      }
    }
    
    // Battle badges
    if (isBattle && won && !earnedTypes.includes('battle_victor')) {
      const badge = await awardBadge(userId, 'battle_victor');
      if (badge) awardedBadges.push(badge);
    }
    
    // Time-based badges
    const hour = new Date().getHours();
    if (hour < 7 && !earnedTypes.includes('early_bird')) {
      const badge = await awardBadge(userId, 'early_bird');
      if (badge) awardedBadges.push(badge);
    }
    if (hour >= 23 && !earnedTypes.includes('night_owl')) {
      const badge = await awardBadge(userId, 'night_owl');
      if (badge) awardedBadges.push(badge);
    }
    
  } catch (error) {
    console.error("Error checking badges:", error);
  }
  
  return awardedBadges;
};

// Award a specific badge
const awardBadge = async (userId, badgeId) => {
  const badgeDef = BADGE_DEFINITIONS[badgeId];
  if (!badgeDef) return null;
  
  try {
    const achievement = await Achievement.create({
      user_id: userId,
      achievement_type: badgeId,
      title: badgeDef.title,
      description: badgeDef.description,
      icon: badgeDef.icon,
      is_rare: ['rare', 'epic', 'legendary'].includes(badgeDef.rarity),
      xp_reward: badgeDef.xp
    });
    
    // Add XP to user
    await UserProgress.findOneAndUpdate(
      { user_id: userId },
      { $inc: { total_xp: badgeDef.xp } }
    );
    
    return {
      ...badgeDef,
      earnedAt: achievement.earned_at
    };
  } catch (error) {
    console.error("Error awarding badge:", error);
    return null;
  }
};

// Get badge progress for a user
export const getBadgeProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await UserProgress.findOne({ user_id: userId });
    
    if (!progress) {
      return res.json({
        success: true,
        data: { progress: [] }
      });
    }
    
    // Calculate progress toward various badges
    const badgeProgress = [
      {
        badge: BADGE_DEFINITIONS.marathon_runner,
        current: progress.total_quizzes_completed,
        target: 50,
        percentage: Math.min(100, Math.round((progress.total_quizzes_completed / 50) * 100))
      },
      {
        badge: BADGE_DEFINITIONS.math_master,
        current: progress.subject_progress?.find(s => s.subject === 'Math')?.questions_correct || 0,
        target: 100,
        percentage: Math.min(100, Math.round(((progress.subject_progress?.find(s => s.subject === 'Math')?.questions_correct || 0) / 100) * 100))
      }
    ];
    
    res.json({
      success: true,
      data: { progress: badgeProgress }
    });
    
  } catch (error) {
    console.error("Error getting badge progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get progress"
    });
  }
};
