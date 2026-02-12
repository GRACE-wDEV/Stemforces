import User from "../models/user.model.js";
import UserProgress from "../models/userProgress.model.js";

// Get global leaderboard based on real user progress
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, timeframe = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build aggregation pipeline for leaderboard
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.deleted_at': { $exists: false }
        }
      }
    ];

    // Add timeframe filter if specified
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      pipeline.push({
        $match: {
          last_activity_date: { $gte: weekAgo }
        }
      });
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      pipeline.push({
        $match: {
          last_activity_date: { $gte: monthAgo }
        }
      });
    }

    // Add sorting and projection
    pipeline.push(
      {
        $sort: { total_xp: -1, total_questions_correct: -1 }
      },
      {
        $project: {
          username: '$user.username',
          name: '$user.name',
          total_xp: 1,
          level: 1,
          total_questions_correct: 1,
          total_quizzes_completed: 1,
          current_streak: 1,
          last_activity_date: 1,
          rank: {
            $add: [
              {
                $multiply: [
                  { $toInt: { $subtract: [page, 1] } },
                  { $toInt: limit }
                ]
              },
              1
            ]
          }
        }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    );

    const [leaderboard, totalUsers] = await Promise.all([
      UserProgress.aggregate(pipeline),
      UserProgress.countDocuments({})
    ]);

    // Add rank numbers
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));

    res.json({
      success: true,
      data: {
        leaderboard: leaderboardWithRank,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        },
        timeframe
      }
    });

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get subject-specific leaderboard
export const getSubjectLeaderboard = async (req, res) => {
  try {
    const { subject } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.deleted_at': { $exists: false }
        }
      },
      {
        $unwind: '$subject_progress'
      },
      {
        $match: {
          'subject_progress.subject': subject
        }
      },
      {
        $sort: {
          'subject_progress.questions_correct': -1,
          'subject_progress.average_score': -1
        }
      },
      {
        $project: {
          username: '$user.username',
          name: '$user.name',
          questions_correct: '$subject_progress.questions_correct',
          questions_attempted: '$subject_progress.questions_attempted',
          average_score: '$subject_progress.average_score',
          best_score: '$subject_progress.best_score',
          quizzes_completed: '$subject_progress.quizzes_completed',
          time_spent: '$subject_progress.time_spent'
        }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ];

    const [leaderboard, totalUsers] = await Promise.all([
      UserProgress.aggregate(pipeline),
      UserProgress.aggregate([
        { $unwind: '$subject_progress' },
        { $match: { 'subject_progress.subject': subject } },
        { $count: 'total' }
      ])
    ]);

    const total = totalUsers[0]?.total || 0;

    // Add rank numbers
    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }));

    res.json({
      success: true,
      data: {
        leaderboard: leaderboardWithRank,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        subject
      }
    });

  } catch (error) {
    console.error("Error fetching subject leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get user's ranking and stats
export const getUserRanking = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's progress
    const userProgress = await UserProgress.findOne({ user_id: userId })
      .populate('user_id', 'username name');

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: "User progress not found"
      });
    }

    // Calculate global rank
    const usersAbove = await UserProgress.countDocuments({
      $or: [
        { total_xp: { $gt: userProgress.total_xp } },
        {
          total_xp: userProgress.total_xp,
          total_questions_correct: { $gt: userProgress.total_questions_correct }
        }
      ]
    });

    const globalRank = usersAbove + 1;

    // Get nearby users for context
    const nearbyUsers = await UserProgress.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { total_xp: -1, total_questions_correct: -1 }
      },
      {
        $project: {
          username: '$user.username',
          total_xp: 1,
          level: 1,
          total_questions_correct: 1
        }
      },
      {
        $skip: Math.max(0, globalRank - 3)
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        userStats: {
          username: userProgress.user_id.username,
          name: userProgress.user_id.name,
          globalRank,
          total_xp: userProgress.total_xp,
          level: userProgress.level,
          total_questions_correct: userProgress.total_questions_correct,
          total_quizzes_completed: userProgress.total_quizzes_completed,
          current_streak: userProgress.current_streak
        },
        nearbyUsers
      }
    });

  } catch (error) {
    console.error("Error fetching user ranking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};