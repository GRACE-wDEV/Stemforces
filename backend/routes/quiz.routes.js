import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getQuizById,
  submitQuiz,
  quickCreateQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Public quiz routes
router.get("/:id", getQuizById);

// Protected quiz routes
router.post("/:id/submit", protect, submitQuiz);
router.post("/quick-create", protect, quickCreateQuiz);

// Admin-level quiz management (if needed for non-admin users)
router.route("/")
  .post(protect, createQuiz);

router.route("/:id/manage")
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

export default router;