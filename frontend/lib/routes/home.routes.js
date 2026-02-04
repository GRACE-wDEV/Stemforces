import express from "express";
import { getHomePageData, getQuizQuestions } from "../controllers/home.controller.js";

const router = express.Router();

// Get home page data (subjects, stats, achievements)
router.get("/data", getHomePageData);

// Get quiz questions for a specific topic
router.get("/quiz/:subjectId/:topicId", getQuizQuestions);

export default router;