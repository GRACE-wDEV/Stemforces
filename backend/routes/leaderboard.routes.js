import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getGlobalLeaderboard,
  getSubjectLeaderboard,
  getUserRanking
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

// Public leaderboard routes
router.get("/", getGlobalLeaderboard);
router.get("/subject/:subject", getSubjectLeaderboard);

// Protected routes
router.get("/me", protect, getUserRanking);

export default router;
