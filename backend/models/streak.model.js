import mongoose from "mongoose";

const streakSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    
    // Current streak info
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    
    // Last activity date (for streak calculation)
    lastActivityDate: { type: Date },
    
    // Streak freeze (protection)
    freezesAvailable: { type: Number, default: 1 },
    freezeUsedToday: { type: Boolean, default: false },
    
    // Weekly tracking
    weeklyActivity: [{
      date: Date,
      questionsAnswered: { type: Number, default: 0 },
      xpEarned: { type: Number, default: 0 },
      quizzesCompleted: { type: Number, default: 0 },
      timeSpent: { type: Number, default: 0 } // minutes
    }],
    
    // Monthly stats
    monthlyStreaks: [{
      month: String, // Format: "2024-01"
      maxStreak: Number,
      totalActiveDays: Number
    }],
    
    // Milestones reached
    milestones: [{
      days: Number,
      reachedAt: Date,
      reward: {
        xp: Number,
        badge: String
      }
    }],
    
    // Streak multipliers
    currentMultiplier: { type: Number, default: 1.0 },
    
    // Notifications
    reminderEnabled: { type: Boolean, default: true },
    reminderTime: { type: String, default: "18:00" } // HH:mm format
  },
  { timestamps: true }
);

// Calculate multiplier based on streak
streakSchema.methods.calculateMultiplier = function() {
  const streak = this.currentStreak;
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
};

// Check if streak is active today
streakSchema.methods.isActiveToday = function() {
  if (!this.lastActivityDate) return false;
  const today = new Date().toDateString();
  return this.lastActivityDate.toDateString() === today;
};

// Update streak
streakSchema.methods.updateStreak = async function() {
  const now = new Date();
  const today = now.toDateString();
  
  if (this.lastActivityDate) {
    const lastDate = new Date(this.lastActivityDate);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.toDateString() === today) {
      // Already logged today
      return { maintained: true, streak: this.currentStreak };
    } else if (lastDate.toDateString() === yesterday.toDateString()) {
      // Continuing streak
      this.currentStreak += 1;
    } else {
      // Streak broken (check for freeze)
      if (this.freezesAvailable > 0 && !this.freezeUsedToday) {
        this.freezesAvailable -= 1;
        this.freezeUsedToday = true;
      } else {
        this.currentStreak = 1;
      }
    }
  } else {
    this.currentStreak = 1;
  }
  
  // Update longest streak
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  // Update multiplier
  this.currentMultiplier = this.calculateMultiplier();
  
  // Check milestones
  const milestonesDays = [3, 7, 14, 30, 60, 100, 365];
  const currentMilestones = this.milestones.map(m => m.days);
  
  for (const days of milestonesDays) {
    if (this.currentStreak >= days && !currentMilestones.includes(days)) {
      const rewards = {
        3: { xp: 50, badge: 'streak_starter' },
        7: { xp: 100, badge: 'week_warrior' },
        14: { xp: 200, badge: 'fortnight_fighter' },
        30: { xp: 500, badge: 'monthly_master' },
        60: { xp: 1000, badge: 'dedication_king' },
        100: { xp: 2000, badge: 'century_champion' },
        365: { xp: 5000, badge: 'year_legend' }
      };
      
      this.milestones.push({
        days,
        reachedAt: now,
        reward: rewards[days]
      });
    }
  }
  
  this.lastActivityDate = now;
  this.freezeUsedToday = false;
  
  await this.save();
  
  return {
    maintained: true,
    streak: this.currentStreak,
    multiplier: this.currentMultiplier,
    newMilestones: this.milestones.filter(m => 
      m.reachedAt.toDateString() === today
    )
  };
};

// Index for queries (user_id already has unique index)
streakSchema.index({ currentStreak: -1 });

const Streak = mongoose.model("Streak", streakSchema);
export default Streak;
