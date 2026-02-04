import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    rules: {
      subject: { type: String },
      difficulty: { type: String, enum: ["easy", "medium", "hard", "mixed"] },
      count: { type: Number, default: 10 },
      tags: [{ type: String }],
      randomize: { type: Boolean, default: true }
    },
    
    total_time: { type: Number, required: true },
    per_question_time: { type: Number },
    
    randomized: { type: Boolean, default: true },
    show_results: { type: Boolean, default: true },
    allow_review: { type: Boolean, default: false },
    passing_score: { type: Number, default: 60 },
    
    start_time: { type: Date },
    end_time: { type: Date },
    
    published: { type: Boolean, default: false },
    
    attempts: { type: Number, default: 0 },
    avg_score: { type: Number, default: 0 },
    
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

quizSchema.index({ published: 1, start_time: 1, end_time: 1 });

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
export default Quiz;
