import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getUserBadges,
  getBadgeProgress
} from "../controllers/achievement.controller.js";

const router = express.Router();

// Protected routes - user must be logged in
router.use(protect);

// Get all badges (earned and locked)
router.get("/badges", getUserBadges);

// Get progress toward badges
router.get("/badges/progress", getBadgeProgress);

export default router;
