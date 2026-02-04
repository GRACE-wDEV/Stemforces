import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true
    },
    
    title: { type: String, required: true },
    description: { type: String },
    
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    }],
    
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "extreme"],
      default: "medium"
    },
    
    timeLimit: { type: Number, default: 15 },
    
    baseXP: { type: Number, default: 100 },
    bonusXP: { type: Number, default: 50 },
    streakMultiplier: { type: Boolean, default: true },
    
    modifiers: {
      noHints: { type: Boolean, default: false },
      speedBonus: { type: Boolean, default: true },
      perfectBonus: { type: Boolean, default: true }
    },
    
    subject: { type: String },
    
    totalParticipants: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

dailyChallengeSchema.index({ active: 1, date: -1 });

const DailyChallenge = mongoose.models.DailyChallenge || mongoose.model("DailyChallenge", dailyChallengeSchema);
export default DailyChallenge;
