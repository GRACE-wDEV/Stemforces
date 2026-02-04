import express from "express";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { fileURLToPath } from "url";
import connectDB from "./config/dp.js";
import cors from "cors";
import { PORT } from "./config/env.js";
import questionRoutes from "./routes/question.routes.js";
import authRoutes from "./routes/auth.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import homeRoutes from "./routes/home.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import dailyChallengeRoutes from "./routes/dailyChallenge.routes.js";
import battleRoutes from "./routes/battle.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();
app.use(helmet());
app.use(compression());

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://stemforces.vercel.app', /\.vercel\.app$/]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5199'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// basic rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend in production (built files)
// NOTE: static frontend serving is registered after API routes below

app.get("/", (req, res) => {
  res.json({
    message: "🚀 STEMFORCES API is running!",
    version: "2.0.0",
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

// Routes
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

// Serve frontend in production (built files)
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const server = app.listen(PORT || 5000, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 STEMFORCES SERVER RUNNING                           ║
  ║                                                           ║
  ║   📍 URL: http://localhost:${PORT || 5000}                         ║
  ║                                                           ║
  ║   ✨ Features:                                            ║
  ║      • Daily Challenges                                   ║
  ║      • Quiz Battles                                       ║
  ║      • Achievement System                                 ║
  ║      • Streak Tracking                                    ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

// Keep the server running
server.on('error', (err) => {
  console.error('Server error:', err);
});
