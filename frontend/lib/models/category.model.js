import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { type: String },
    
    subject: { 
      type: String, 
      required: true,
      enum: ["Math", "Physics", "Chemistry", "French", "Geology", "Biology", "English", "Deutsch", "Arabic", "Mechanics"]
    },
    
    icon: { type: String, default: "Folder" },
    color: { type: String, default: "#6366f1" },
    
    order: { type: Number, default: 0 },
    
    active: { type: Boolean, default: true },
    
    quizCount: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
    
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

categorySchema.index({ subject: 1, name: 1 }, { unique: true });
categorySchema.index({ subject: 1, order: 1 });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
