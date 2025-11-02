import express from "express";
import { registerUser, loginUser, getCurrentUser, updateCurrentUser } from "../controllers/auth.controller.js";
import { admin, protect } from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateCurrentUser);
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;