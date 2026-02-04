import express from "express";
import { protect, admin, editor } from "../middlewares/auth.middleware.js";
import {
  getCategories,
  getCategoriesBySubject,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

// Public routes
router.get("/browse", getCategoriesBySubject);
router.get("/:id", getCategoryById);

// Admin routes
router.route("/")
  .get(protect, editor, getCategories)
  .post(protect, editor, createCategory);

router.route("/:id")
  .put(protect, editor, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
