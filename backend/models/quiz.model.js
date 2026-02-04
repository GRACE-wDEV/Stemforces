import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    
    // Category/Folder this quiz belongs to
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    
    // Quiz composition - either direct questions or rules
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    rules: {
      subject: { type: String },
      difficulty: { type: String, enum: ["easy", "medium", "hard", "mixed"] },
      count: { type: Number, default: 10 },
      tags: [{ type: String }],
      randomize: { type: Boolean, default: true }
    },
    
    // Timing settings
    total_time: { type: Number, required: true }, // Total quiz time in minutes
    per_question_time: { type: Number }, // Optional per-question time limit
    
    // Settings
    randomized: { type: Boolean, default: true },
    show_results: { type: Boolean, default: true },
    allow_review: { type: Boolean, default: false },
    passing_score: { type: Number, default: 60 }, // Percentage to pass
    
    // Scheduling
    start_time: { type: Date },
    end_time: { type: Date },
    
    // Status
    published: { type: Boolean, default: false },
    
    // Stats
    attempts: { type: Number, default: 0 },
    avg_score: { type: Number, default: 0 },
    
    // Metadata
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for better performance
quizSchema.index({ published: 1, start_time: 1, end_time: 1 });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;