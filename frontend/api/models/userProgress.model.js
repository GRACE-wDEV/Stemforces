import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    
    total_questions_attempted: { type: Number, default: 0 },
    total_questions_correct: { type: Number, default: 0 },
    total_quizzes_completed: { type: Number, default: 0 },
    total_time_spent: { type: Number, default: 0 },
    current_streak: { type: Number, default: 0 },
    longest_streak: { type: Number, default: 0 },
    last_activity_date: { type: Date, default: Date.now },
    
    total_xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    
    subject_progress: [{
      subject: { type: String, required: true },
      questions_attempted: { type: Number, default: 0 },
      questions_correct: { type: Number, default: 0 },
      quizzes_completed: { type: Number, default: 0 },
      time_spent: { type: Number, default: 0 },
      best_score: { type: Number, default: 0 },
      average_score: { type: Number, default: 0 }
    }],
    
    quiz_attempts: [{
      quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      subject: String,
      score: Number,
      time_taken: Number,
      questions_correct: Number,
      questions_total: Number,
      completed_at: { type: Date, default: Date.now }
    }],
    
    daily_activity: [{
      date: { type: Date, required: true },
      questions_answered: { type: Number, default: 0 },
      time_spent: { type: Number, default: 0 },
      xp_gained: { type: Number, default: 0 }
    }]
  },
  { timestamps: true }
);

userProgressSchema.index({ "daily_activity.date": 1 });
userProgressSchema.index({ total_xp: -1 });

const UserProgress = mongoose.models.UserProgress || mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;
