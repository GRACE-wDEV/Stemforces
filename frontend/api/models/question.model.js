import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  is_correct: { type: Boolean, default: false },
  image_url: { type: String }
});

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    question_text: { type: String, required: true },
    image_url: { type: String },
    choices: [choiceSchema],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true
    },
    time_limit_seconds: { type: Number, required: true, default: 60 },
    subject: { 
      type: String, 
      required: true,
      enum: ["Math", "Physics", "Chemistry", "French", "Geology", "Biology", "English", "Deutsch", "Arabic", "Mechanics"]
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    source: { type: String, required: true },
    tags: [{ type: String }],
    explanation: { type: String },
    attachments: [{
      filename: String,
      url: String,
      mimetype: String,
      size: Number
    }],
    
    text: { type: String },
    options: [{ type: String }],
    correctAnswer: { type: String },
    
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    version: { type: Number, default: 1 },
    published: { type: Boolean, default: true },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

questionSchema.virtual('createdBy').get(function() {
  return this.created_by;
});

questionSchema.index({ subject: 1, difficulty: 1, tags: 1 });
questionSchema.index({ question_text: "text", title: "text", tags: "text" });

const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);
export default Question;
