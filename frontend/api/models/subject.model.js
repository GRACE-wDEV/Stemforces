import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    color: { type: String, default: "#3B82F6" },
    icon: { type: String, default: "BookOpen" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
export default Subject;
