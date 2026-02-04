import mongoose from "mongoose";

/**
 * Category Model
 * Represents folders/themes within a subject (e.g., "Past Exams", "URT Exams", etc.)
 * Structure: Subject → Category → Quizzes/Questions
 */
const categorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { type: String },
    
    // Parent subject
    subject: { 
      type: String, 
      required: true,
      enum: ["Math", "Physics", "Chemistry", "French", "Geology", "Biology", "English", "Deutsch", "Arabic", "Mechanics"]
    },
    
    // Visual customization
    icon: { type: String, default: "Folder" }, // Lucide icon name
    color: { type: String, default: "#6366f1" }, // Hex color
    
    // Ordering
    order: { type: Number, default: 0 },
    
    // Status
    active: { type: Boolean, default: true },
    
    // Stats (auto-updated)
    quizCount: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
    
    // Created by
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Compound index for unique category names per subject
categorySchema.index({ subject: 1, name: 1 }, { unique: true });
categorySchema.index({ subject: 1, order: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
