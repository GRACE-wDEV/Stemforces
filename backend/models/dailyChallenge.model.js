import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema(
  {
    // Challenge date (one per day)
    date: {
      type: Date,
      required: true,
      unique: true
    },
    
    // Challenge details
    title: { type: String, required: true },
    description: { type: String },
    
    // Questions for this challenge
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    }],
    
    // Difficulty and rewards
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "extreme"],
      default: "medium"
    },
    
    // Time limit in minutes
    timeLimit: { type: Number, default: 15 },
    
    // Rewards
    baseXP: { type: Number, default: 100 },
    bonusXP: { type: Number, default: 50 }, // For perfect score
    streakMultiplier: { type: Boolean, default: true },
    
    // Special modifiers
    modifiers: {
      noHints: { type: Boolean, default: false },
      speedBonus: { type: Boolean, default: true },
      perfectBonus: { type: Boolean, default: true }
    },
    
    // Subject focus (optional - for themed days)
    subject: { type: String },
    
    // Participation stats
    totalParticipants: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    
    // Status
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for efficient queries (date already has unique index)
dailyChallengeSchema.index({ active: 1, date: -1 });

const DailyChallenge = mongoose.model("DailyChallenge", dailyChallengeSchema);
export default DailyChallenge;
