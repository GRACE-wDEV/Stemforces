// Serverless Express API for Vercel
// This runs the entire Express backend as a serverless function

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Import all routes from lib folder (outside api/ to avoid multiple function creation)
import authRoutes from "../lib/routes/auth.routes.js";
import questionRoutes from "../lib/routes/question.routes.js";
import quizRoutes from "../lib/routes/quiz.routes.js";
import categoryRoutes from "../lib/routes/category.routes.js";
import leaderboardRoutes from "../lib/routes/leaderboard.routes.js";
import adminRoutes from "../lib/routes/admin.routes.js";
import homeRoutes from "../lib/routes/home.routes.js";
import dailyChallengeRoutes from "../lib/routes/dailyChallenge.routes.js";
import battleRoutes from "../lib/routes/battle.routes.js";
import achievementRoutes from "../lib/routes/achievement.routes.js";
import aiRoutes from "../lib/routes/ai.routes.js";
import uploadRoutes from "../lib/routes/upload.routes.js";

const app = express();

// MongoDB connection caching for serverless
let cachedConnection = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    cachedConnection = conn;
    console.log("MongoDB Connected (serverless)");
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// CORS configuration
const corsOptions = {
  origin: [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5199',
    /\.vercel\.app$/
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Connect to DB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "🚀 STEMFORCES API is running!",
    version: "2.0.0",
    environment: "serverless",
    features: [
      "📚 Quizzes & Questions",
      "🏆 Leaderboards",
      "🔥 Daily Challenges",
      "⚔️ Quiz Battles",
      "🎖️ Achievements & Badges",
      "📈 Progress Tracking",
      "🤖 AI Tutor & Explanations"
    ]
  });
});

// Routes - all prefixed with /api
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/daily-challenge", dailyChallengeRoutes);
app.use("/api/battle", battleRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler for API routes (Express 5 syntax)
app.use("/api/:path(*)", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

export default app;
