import express from "express";
import {
  addQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  addMultipleQuestions,
  getRandomQuestion,
  searchQuestions,
  browseBySubject,
  getQuizQuestions,
} from "../controllers/question.controller.js";
import {protect, admin} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/")
  .post(protect, admin, addQuestion)
  .get(getQuestions);

router.route("/search/:keyword").get(searchQuestions);
router.route("/random").get(getRandomQuestion);
router.route("/bulk").post(protect, admin, addMultipleQuestions);
router.route("/browse/:subject").get(browseBySubject);
router.route("/quiz").get(getQuizQuestions);

router.route("/:id")
  .get(getQuestionById)
  .put(protect, admin, updateQuestion)
  .delete(protect, admin, deleteQuestion);

export default router;