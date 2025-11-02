import express from "express";
import User from "../models/user.model.js";

const router = express.Router();

/**
 * GET leaderboard
 * Returns top users sorted by score (descending)
 */
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // default top 10
    const leaderboard = await User.find({})
      .sort({ score: -1 }) // highest first
      .limit(limit)
      .select("username score"); // only show needed fields

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

/**
 * POST update score
 * Example: { userId, delta }
 */
router.post("/update", async (req, res) => {
  try {
    const { userId, delta } = req.body;

    if (!userId || typeof delta !== "number") {
      return res.status(400).json({ error: "Invalid request" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.score += delta;
    await user.save();

    res.json({ message: "Score updated", newScore: user.score });
  } catch (err) {
    res.status(500).json({ error: "Failed to update score" });
  }
});

export default router;
