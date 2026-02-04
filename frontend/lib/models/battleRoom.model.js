import mongoose from "mongoose";

const battleRoomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    players: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: String,
      avatar: String,
      score: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      averageTime: { type: Number, default: 0 },
      isReady: { type: Boolean, default: false },
      isOnline: { type: Boolean, default: true },
      joinedAt: { type: Date, default: Date.now }
    }],
    
    config: {
      maxPlayers: { type: Number, default: 4, min: 2, max: 10 },
      questionsCount: { type: Number, default: 10 },
      timePerQuestion: { type: Number, default: 30 },
      subject: { type: String },
      difficulty: { type: String, enum: ["easy", "medium", "hard", "mixed"], default: "mixed" },
      isPrivate: { type: Boolean, default: false }
    },
    
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question"
    }],
    
    currentQuestion: { type: Number, default: 0 },
    answers: [{
      questionIndex: Number,
      playerAnswers: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        answer: String,
        isCorrect: Boolean,
        timeSpent: Number,
        points: Number
      }]
    }],
    
    status: {
      type: String,
      enum: ["waiting", "starting", "in-progress", "finished", "cancelled"],
      default: "waiting"
    },
    
    startedAt: { type: Date },
    endedAt: { type: Date },
    questionStartedAt: { type: Date },
    
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    finalRankings: [{
      player: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rank: Number,
      score: Number,
      correctAnswers: Number,
      xpEarned: Number
    }]
  },
  { timestamps: true }
);

battleRoomSchema.index({ status: 1, createdAt: -1 });
battleRoomSchema.index({ "players.user": 1 });

battleRoomSchema.statics.generateRoomCode = async function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let exists = true;
  
  while (exists) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    exists = await this.findOne({ roomCode: code, status: { $in: ['waiting', 'starting', 'in-progress'] } });
  }
  
  return code;
};

const BattleRoom = mongoose.models.BattleRoom || mongoose.model("BattleRoom", battleRoomSchema);
export default BattleRoom;
