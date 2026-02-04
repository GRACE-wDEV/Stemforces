import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createBattleRoom,
  joinBattleRoom,
  getBattleRoom,
  toggleReady,
  startBattle,
  submitAnswer,
  endBattle,
  getPublicRooms,
  leaveBattleRoom
} from "../controllers/battle.controller.js";

const router = express.Router();

// Get public battle rooms (no auth required)
router.get("/public", getPublicRooms);

// Protected routes
router.use(protect);

// Create a new battle room
router.post("/create", createBattleRoom);

// Join a battle room
router.post("/:roomCode/join", joinBattleRoom);

// Get room details
router.get("/:roomCode", getBattleRoom);

// Toggle ready status
router.post("/:roomCode/ready", toggleReady);

// Start the battle (host only)
router.post("/:roomCode/start", startBattle);

// Submit an answer
router.post("/:roomCode/answer", submitAnswer);

// End the battle
router.post("/:roomCode/end", endBattle);

// Leave the room
router.post("/:roomCode/leave", leaveBattleRoom);

export default router;
