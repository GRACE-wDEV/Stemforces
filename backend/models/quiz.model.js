import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    
    // Quiz composition - either direct questions or rules
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }], // Direct question list
    rules: {
      subject: { type: String },
      difficulty: { type: String, enum: ["easy", "medium", "hard"] },
      count: { type: Number, default: 10 },
      tags: [{ type: String }],
      randomize: { type: Boolean, default: true }
    },
    
    // Timing settings
    total_time: { type: Number, required: true }, // Total quiz time in minutes
    per_question_time: { type: Number }, // Optional per-question time limit
    
    // Settings
    randomized: { type: Boolean, default: true }, // Randomize question order
    show_results: { type: Boolean, default: true }, // Show results after completion
    allow_review: { type: Boolean, default: false }, // Allow reviewing answers
    
    // Scheduling
    start_time: { type: Date },
    end_time: { type: Date },
    
    // Status
    published: { type: Boolean, default: false },
    
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