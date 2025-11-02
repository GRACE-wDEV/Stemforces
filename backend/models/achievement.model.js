import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    // Achievement details
    achievement_type: {
      type: String,
      required: true,
      enum: [
        'first_quiz',
        'perfect_score',
        'speed_demon',
        'streak_master',
        'subject_expert',
        'quiz_champion',
        'early_bird',
        'night_owl',
        'consistent_learner',
        'quick_learner',
        'marathon_runner',
        'perfectionist'
      ]
    },
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    
    // Achievement context
    subject: String, // For subject-specific achievements
    quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    value: Number, // The value that triggered the achievement (score, streak, etc.)
    
    // Metadata
    earned_at: { type: Date, default: Date.now },
    is_rare: { type: Boolean, default: false },
    xp_reward: { type: Number, default: 50 }
  },
  { timestamps: true }
);

// Index for better performance
achievementSchema.index({ user_id: 1, earned_at: -1 });
achievementSchema.index({ achievement_type: 1 });

const Achievement = mongoose.model("Achievement", achievementSchema);
export default Achievement;