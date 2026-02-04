import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["user", "editor", "admin"], 
      default: "user" 
    },
    score: { type: Number, default: 0 },
    
    // Admin/Editor specific fields
    permissions: [{
      resource: { type: String, enum: ["questions", "quizzes", "users", "subjects", "analytics"] },
      actions: [{ type: String, enum: ["create", "read", "update", "delete", "publish"] }]
    }],
    
    // Profile info
    avatar: { type: String },
    bio: { type: String },
    department: { type: String },
    
    // User's own Gemini API key for AI features (BYOK - Bring Your Own Key)
    geminiApiKey: { type: String, select: false }, // select: false hides it from queries by default
    
    // Account status
    active: { type: Boolean, default: true },
    email_verified: { type: Boolean, default: false },
    last_login: { type: Date },
    
    // Stats for admins/editors
    questions_created: { type: Number, default: 0 },
    quizzes_created: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
