import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    color: { type: String, default: "#3B82F6" }, // Hex color for UI
    icon: { type: String, default: "BookOpen" }, // Lucide icon name
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;