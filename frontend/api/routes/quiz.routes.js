import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  quickCreateQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizReview
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Public quiz routes
router.get("/", getQuizzes); // List all published quizzes
router.get("/:id", getQuizById);

// Protected quiz routes
router.post("/:id/submit", protect, submitQuiz);
router.get("/:id/review", protect, getQuizReview); // Get review of completed quiz
router.post("/quick-create", protect, quickCreateQuiz);
router.post("/", protect, createQuiz);

// Admin-level quiz management
router.route("/:id/manage")
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

export default router;