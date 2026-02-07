import BattleRoom from "../models/battleRoom.model.js";
import Question from "../models/question.model.js";
import UserProgress from "../models/userProgress.model.js";
import Achievement from "../models/achievement.model.js";

// Create a new battle room
export const createBattleRoom = async (req, res) => {
  try {
    const { config } = req.body;
    const userId = req.user._id;
    
    const roomCode = await BattleRoom.generateRoomCode();
    
    const room = await BattleRoom.create({
      roomCode,
      host: userId,
      players: [{
        user: userId,
        username: req.user.name,
        avatar: req.user.avatar,
        isReady: true
      }],
      config: {
        maxPlayers: config?.maxPlayers || 4,
        questionsCount: config?.questionsCount || 10,
        timePerQuestion: config?.timePerQuestion || 30,
        subject: config?.subject || null,
        difficulty: config?.difficulty || 'mixed',
        isPrivate: config?.isPrivate || false
      }
    });
    
    res.status(201).json({
      success: true,
      data: {
        roomCode: room.roomCode,
        roomId: room._id,
        config: room.config,
        players: room.players
      }
    });
    
  } catch (error) {
    console.error("Error creating battle room:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create battle room"
    });
  }
};

// Join a battle room
export const joinBattleRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;
    
    const room = await BattleRoom.findOne({ 
      roomCode: roomCode.toUpperCase(),
      status: 'waiting'
    }).populate('players.user', 'name avatar');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found or battle already started"
      });
    }
    
    // Check if room is full
    if (room.players.length >= room.config.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: "Room is full"
      });
    }
    
    // Check if already in room
    const existingPlayer = room.players.find(p => p.user._id.toString() === userId.toString());
    if (existingPlayer) {
      return res.json({
        success: true,
        data: formatRoomResponse(room),
        message: "Already in room"
      });
    }
    
    // Add player to room
    room.players.push({
      user: userId,
      username: req.user.name,
      avatar: req.user.avatar,
      isReady: false
    });
    
    await room.save();
    await room.populate('players.user', 'name avatar');
    
    res.json({
      success: true,
      data: formatRoomResponse(room)
    });
    
  } catch (error) {
    console.error("Error joining battle room:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join room"
    });
  }
};

// Get room details
export const getBattleRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await BattleRoom.findOne({ roomCode: roomCode.toUpperCase() })
      .populate('players.user', 'name avatar')
      .populate('host', 'name avatar');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
    
    res.json({
      success: true,
      data: formatRoomResponse(room)
    });
    
  } catch (error) {
    console.error("Error getting battle room:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get room"
    });
  }
};

// Player ready toggle
export const toggleReady = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;
    
    const room = await BattleRoom.findOne({ 
      roomCode: roomCode.toUpperCase(),
      status: 'waiting'
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
    
    const player = room.players.find(p => p.user.toString() === userId.toString());
    if (!player) {
      return res.status(400).json({
        success: false,
        message: "You are not in this room"
      });
    }
    
    player.isReady = !player.isReady;
    await room.save();
    
    // Check if all players are ready
    const allReady = room.players.every(p => p.isReady);
    
    res.json({
      success: true,
      data: {
        isReady: player.isReady,
        allReady,
        readyCount: room.players.filter(p => p.isReady).length,
        totalPlayers: room.players.length
      }
    });
    
  } catch (error) {
    console.error("Error toggling ready:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ready status"
    });
  }
};

// Start the battle
export const startBattle = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;
    
    const room = await BattleRoom.findOne({ 
      roomCode: roomCode.toUpperCase(),
      status: 'waiting'
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found or already started"
      });
    }
    
    // Only host can start
    if (room.host.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the host can start the battle"
      });
    }
    
    // Need at least 2 players
    if (room.players.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Need at least 2 players to start"
      });
    }
    
    // Fetch questions
    const query = { published: true, deleted_at: null };
    if (room.config.subject) {
      query.subject = room.config.subject;
    }
    if (room.config.difficulty && room.config.difficulty !== 'mixed') {
      query.difficulty = room.config.difficulty;
    }
    
    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: room.config.questionsCount } }
    ]);
    
    if (questions.length < room.config.questionsCount) {
      return res.status(400).json({
        success: false,
        message: `Not enough questions available. Found ${questions.length}, need ${room.config.questionsCount}`
      });
    }
    
    room.questions = questions.map(q => q._id);
    room.status = 'in-progress';
    room.startedAt = new Date(Date.now() + 5000); // 5 second countdown
    
    await room.save();
    
    // Format questions for response (hide answers)
    const formattedQuestions = questions.map((q, index) => ({
      id: q._id,
      index: index + 1,
      title: q.title,
      subject: q.subject,
      difficulty: q.difficulty,
      points: q.points || 10,
      options: q.options?.map(opt => ({
        id: opt._id || opt.id,
        text: opt.text
      }))
    }));
    
    res.json({
      success: true,
      data: {
        status: 'in-progress',
        startsIn: 5,
        questions: formattedQuestions,
        config: room.config
      }
    });
    
  } catch (error) {
    console.error("Error starting battle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start battle"
    });
  }
};

// Submit answer for current question
export const submitAnswer = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { questionIndex, answer, timeSpent } = req.body;
    const userId = req.user._id;
    
    const room = await BattleRoom.findOne({ 
      roomCode: roomCode.toUpperCase(),
      status: 'in-progress'
    }).populate('questions');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Battle not found or not in progress"
      });
    }
    
    const player = room.players.find(p => p.user.toString() === userId.toString());
    if (!player) {
      return res.status(400).json({
        success: false,
        message: "You are not in this battle"
      });
    }
    
    // Get the question
    const question = room.questions[questionIndex];
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index"
      });
    }
    
    // Check if correct
    const isCorrect = answer === question.correctAnswer;
    
    // Calculate points (time bonus: faster = more points)
    const basePoints = question.points || 10;
    const timeBonus = Math.max(0, room.config.timePerQuestion - timeSpent) / room.config.timePerQuestion;
    const points = isCorrect ? Math.round(basePoints * (1 + timeBonus * 0.5)) : 0;
    
    // Update player score
    player.score += points;
    if (isCorrect) player.correctAnswers += 1;
    player.averageTime = ((player.averageTime * questionIndex) + timeSpent) / (questionIndex + 1);
    
    // Record answer
    let questionAnswers = room.answers.find(a => a.questionIndex === questionIndex);
    if (!questionAnswers) {
      room.answers.push({ questionIndex, playerAnswers: [] });
      questionAnswers = room.answers[room.answers.length - 1];
    }
    
    questionAnswers.playerAnswers.push({
      player: userId,
      answer,
      isCorrect,
      timeSpent,
      points
    });
    
    await room.save();
    
    // Get current standings
    const standings = room.players
      .map(p => ({
        id: p.user,
        username: p.username,
        score: p.score,
        correctAnswers: p.correctAnswers
      }))
      .sort((a, b) => b.score - a.score);
    
    res.json({
      success: true,
      data: {
        isCorrect,
        points,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        playerScore: player.score,
        standings
      }
    });
    
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit answer"
    });
  }
};

// End battle and calculate results
export const endBattle = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await BattleRoom.findOne({ 
      roomCode: roomCode.toUpperCase()
    }).populate('players.user', 'name avatar');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
    
    // Calculate final rankings
    const rankings = room.players
      .map(p => ({
        player: p.user._id,
        username: p.username,
        avatar: p.avatar,
        score: p.score,
        correctAnswers: p.correctAnswers,
        averageTime: Math.round(p.averageTime * 10) / 10
      }))
      .sort((a, b) => b.score - a.score || a.averageTime - b.averageTime);
    
    // Assign ranks and XP
    const xpRewards = [100, 60, 40, 25, 15, 10, 5, 5, 5, 5];
    
    room.finalRankings = rankings.map((r, index) => ({
      ...r,
      rank: index + 1,
      xpEarned: xpRewards[index] || 5
    }));
    
    room.winner = rankings[0]?.player;
    room.status = 'finished';
    room.endedAt = new Date();
    
    await room.save();
    
    // Update user progress for all players
    for (const ranking of room.finalRankings) {
      await UserProgress.findOneAndUpdate(
        { user_id: ranking.player },
        {
          $inc: {
            total_xp: ranking.xpEarned,
            total_questions_attempted: room.config.questionsCount,
            total_questions_correct: ranking.correctAnswers
          }
        },
        { upsert: true }
      );
      
      // Achievement for winning
      if (ranking.rank === 1) {
        const existingWin = await Achievement.countDocuments({
          user_id: ranking.player,
          achievement_type: 'battle_winner'
        });
        
        if (existingWin === 0) {
          await Achievement.create({
            user_id: ranking.player,
            achievement_type: 'battle_winner',
            title: 'Battle Victor',
            description: 'Won your first quiz battle',
            icon: '⚔️',
            xp_reward: 50
          });
        }
      }
    }
    
    res.json({
      success: true,
      data: {
        status: 'finished',
        winner: {
          id: rankings[0]?.player,
          username: rankings[0]?.username,
          score: rankings[0]?.score
        },
        rankings: room.finalRankings,
        totalQuestions: room.config.questionsCount,
        duration: Math.round((room.endedAt - room.startedAt) / 1000)
      }
    });
    
  } catch (error) {
    console.error("Error ending battle:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end battle"
    });
  }
};

// Get public battle rooms
export const getPublicRooms = async (req, res) => {
  try {
    const rooms = await BattleRoom.find({
      status: 'waiting',
      'config.isPrivate': false
    })
    .populate('host', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20);
    
    const formattedRooms = rooms.map(room => ({
      roomCode: room.roomCode,
      host: room.host.name,
      players: room.players.length,
      maxPlayers: room.config.maxPlayers,
      subject: room.config.subject || 'Mixed',
      difficulty: room.config.difficulty,
      questionsCount: room.config.questionsCount
    }));
    
    res.json({
      success: true,
      data: formattedRooms
    });
    
  } catch (error) {
    console.error("Error getting public rooms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get rooms"
    });
  }
};

// Leave battle room
export const leaveBattleRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const userId = req.user._id;
    
    const room = await BattleRoom.findOne({ 
      roomCode: roomCode.toUpperCase(),
      status: 'waiting'
    });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found"
      });
    }
    
    room.players = room.players.filter(p => p.user.toString() !== userId.toString());
    
    // If host leaves, transfer to next player or delete room
    if (room.host.toString() === userId.toString()) {
      if (room.players.length > 0) {
        room.host = room.players[0].user;
      } else {
        await BattleRoom.deleteOne({ _id: room._id });
        return res.json({
          success: true,
          message: "Room deleted (no players left)"
        });
      }
    }
    
    await room.save();
    
    res.json({
      success: true,
      message: "Left the room"
    });
    
  } catch (error) {
    console.error("Error leaving room:", error);
    res.status(500).json({
      success: false,
      message: "Failed to leave room"
    });
  }
};

// Helper function
const formatRoomResponse = (room) => ({
  roomCode: room.roomCode,
  roomId: room._id,
  host: {
    id: room.host._id || room.host,
    name: room.host.name
  },
  players: room.players.map(p => ({
    id: p.user._id || p.user,
    username: p.username,
    avatar: p.avatar,
    score: p.score,
    isReady: p.isReady,
    isOnline: p.isOnline
  })),
  config: room.config,
  status: room.status,
  currentQuestion: room.currentQuestion
});
