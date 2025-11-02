import express from "express";
import { protect, admin, editor } from "../middlewares/auth.middleware.js";
import {
  getDashboardStats,
  getAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
  restoreQuestion,
  bulkOperations,
  importQuestions,
  exportQuestions
} from "../controllers/admin.controller.js";
import {
  getAdminQuizzes,
  createAdminQuiz,
  updateAdminQuiz,
  deleteAdminQuiz,
  toggleQuizPublish,
  getAdminQuizById
} from "../controllers/quiz.admin.controller.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard/stats", protect, editor, getDashboardStats);

// Question management routes
router.route("/questions")
  .get(protect, editor, getAdminQuestions)
  .post(protect, editor, createAdminQuestion);

router.route("/questions/:id")
  .put(protect, editor, updateAdminQuestion)
  .delete(protect, editor, deleteAdminQuestion);

router.post("/questions/:id/restore", protect, admin, restoreQuestion);

// Bulk operations
router.post("/questions/bulk", protect, admin, bulkOperations);
router.post("/questions/import", protect, editor, importQuestions);
router.get("/questions/export", protect, editor, exportQuestions);

// Quiz management routes
router.route("/quizzes")
  .get(protect, editor, getAdminQuizzes)
  .post(protect, editor, createAdminQuiz);

router.route("/quizzes/:id")
  .get(protect, editor, getAdminQuizById)
  .put(protect, editor, updateAdminQuiz)
  .delete(protect, editor, deleteAdminQuiz);

router.patch("/quizzes/:id/publish", protect, editor, toggleQuizPublish);

export default router;