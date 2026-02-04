import express from "express";
import { protect, optionalAuth } from "../middlewares/auth.middleware.js";
import {
  getTodayChallenge,
  submitDailyChallenge,
  getDailyChallengeLeaderboard,
  getUserStreak,
  regenerateTodayChallenge
} from "../controllers/dailyChallenge.controller.js";

const router = express.Router();

// Get today's challenge (with optional auth to check completion status)
router.get("/today", optionalAuth, getTodayChallenge);

// Get daily challenge leaderboard
router.get("/leaderboard", getDailyChallengeLeaderboard);

// Protected routes
router.use(protect);

// Submit daily challenge attempt
router.post("/submit", submitDailyChallenge);

// Get user's streak info
router.get("/streak", getUserStreak);

// Regenerate today's challenge (for testing/admin - resets with new questions)
router.post("/regenerate", regenerateTodayChallenge);

export default router;
