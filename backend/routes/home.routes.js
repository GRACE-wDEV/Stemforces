import express from "express";
import { getHomePageData, getQuizQuestions } from "../controllers/home.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get home page data (subjects, stats, achievements) - optionalAuth to get user stats if logged in
router.get("/data", optionalAuth, getHomePageData);

// Get quiz questions for a specific topic
router.get("/quiz/:subjectId/:topicId", getQuizQuestions);

export default router;