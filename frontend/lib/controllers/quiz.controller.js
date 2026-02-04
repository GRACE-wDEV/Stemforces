import Quiz from "../models/quiz.model.js";
import mongoose from 'mongoose';
import Question from "../models/question.model.js";
import { updateUserProgress } from "../utils/progressTracker.js";

// Get all public quizzes (for browse page)
export const getQuizzes = async (req, res) => {
  try {
    const { subject, category, published = 'true' } = req.query;

    const filter = { deleted_at: null };
    if (published === 'true') filter.published = true;
    if (subject) filter.subject = subject;
    if (category) filter.category = category;

    const quizzes = await Quiz.find(filter)
      .populate('category', 'name icon color')
      .select('title description subject total_time questions attempts avg_score published category')
      .sort({ createdAt: -1 });

    // Transform data for frontend
    const transformedQuizzes = quizzes.map(quiz => ({
      _id: quiz._id,
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      totalTime: quiz.total_time,
      questionCount: quiz.questions?.length || 0,
      attempts: quiz.attempts || 0,
      avgScore: quiz.avg_score || 0,
      category: quiz.category
    }));

    res.json({
      success: true,
      quizzes: transformedQuizzes
    });

  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all quizzes for admin
export const getAdminQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 20, subject, difficulty, published } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { deleted_at: null };
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (difficulty) filter.difficulty = difficulty;
    if (published !== undefined) filter.published = published === 'true';

    const [quizzes, total] = await Promise.all([
      Quiz.find(filter)
        .populate('created_by', 'name email')
        .populate('questions', 'title subject difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Quiz.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        quizzes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        }
      }
    });

  } catch (error) {
    console.error("Error fetching admin quizzes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Create new quiz
export const createQuiz = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      difficulty,
      estimatedTime,
      questions,
      published,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !subject) {
      return res.status(400).json({
        success: false,
        message: "Title and subject are required"
      });
    }

    // Verify questions exist
    if (questions && questions.length > 0) {
      const existingQuestions = await Question.find({
        _id: { $in: questions },
        deleted_at: null
      });

      if (existingQuestions.length !== questions.length) {
        return res.status(400).json({
          success: false,
          message: "Some questions do not exist"
        });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      subject,
      difficulty: difficulty || 'Intermediate',
      total_time: estimatedTime || 30,
      questions: questions || [],
      published: published || false,
      created_by: req.user.id,
      rules: {
        subject,
        difficulty: difficulty?.toLowerCase(),
        count: questions?.length || 10,
        tags: tags || [],
        randomize: true
      }
    });

    await quiz.save();

    // Populate the quiz before returning
    await quiz.populate('created_by', 'name email');
    await quiz.populate('questions', 'title subject difficulty');

    res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz created successfully"
    });

  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update quiz
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.created_by;
    delete updates.createdAt;

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('created_by', 'name email')
    .populate('questions', 'title subject difficulty');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    res.json({
      success: true,
      data: quiz,
      message: "Quiz updated successfully"
    });

  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    res.json({
      success: true,
      message: "Quiz deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    // If the id is not a valid Mongo ObjectId, return 404 instead of letting Mongoose throw a CastError
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const quiz = await Quiz.findById(id)
      .populate('created_by', 'name email')
      .populate('questions', 'title subject difficulty question_text choices explanation time_limit_seconds');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Normalize question data for frontend compatibility
    const normalizedQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        id: q._id.toString(),
        _id: q._id,
        title: q.title,
        question: q.question_text, // Map question_text to question for frontend
        question_text: q.question_text,
        subject: q.subject,
        difficulty: q.difficulty,
        explanation: q.explanation,
        time_limit_seconds: q.time_limit_seconds,
        choices: q.choices.map(c => ({
          id: c.id || c._id?.toString(),
          text: c.text,
          is_correct: c.is_correct,
          isCorrect: c.is_correct // Add both formats for compatibility
        }))
      }))
    };

    res.json({
      success: true,
      data: normalizedQuiz
    });

  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Quick create quiz from questions
export const quickCreateQuiz = async (req, res) => {
  try {
    const {
      title,
      subject,
      difficulty,
      questionIds,
      estimatedTime
    } = req.body;

    if (!title || !subject || !questionIds || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title, subject, and questions are required"
      });
    }

    // Verify all questions exist and belong to the subject
    const questions = await Question.find({
      _id: { $in: questionIds },
      subject: subject,
      deleted_at: null,
      published: true
    });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Some questions are invalid or not published"
      });
    }

    const quiz = new Quiz({
      title,
      description: `Auto-generated quiz for ${subject}`,
      subject,
      difficulty: difficulty || 'Intermediate',
      total_time: estimatedTime || Math.max(15, questions.length * 2),
      questions: questionIds,
      published: true,
      created_by: req.user.id,
      rules: {
        subject,
        difficulty: difficulty?.toLowerCase(),
        count: questions.length,
        randomize: true
      }
    });

    await quiz.save();
    await quiz.populate('questions', 'title subject difficulty');

    res.status(201).json({
      success: true,
      data: quiz,
      message: `Quiz "${title}" created successfully with ${questions.length} questions`
    });

  } catch (error) {
    console.error("Error creating quick quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Submit quiz results and update user progress
export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;

    if (!answers || typeof timeTaken !== 'number') {
      return res.status(400).json({
        success: false,
        message: "Quiz answers and time taken are required"
      });
    }

    // ATOMIC double-submit protection using findOneAndUpdate
    // This prevents race conditions where two requests could slip through
    const UserProgress = (await import("../models/userProgress.model.js")).default;
    
    // First, atomically check and mark quiz as "in progress" to prevent double-submit
    const existingAttempt = await UserProgress.findOne({
      user_id: req.user.id,
      'quiz_attempts.quiz_id': id
    });
    
    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: "You have already completed this quiz. You can only review your previous attempt."
      });
    }
    
    // Create placeholder attempt atomically to claim this quiz submission
    // This uses $addToSet-like behavior but with a unique constraint
    const claimResult = await UserProgress.findOneAndUpdate(
      { 
        user_id: req.user.id,
        'quiz_attempts.quiz_id': { $ne: id } // Only if quiz NOT already in attempts
      },
      { 
        $push: { 
          quiz_attempts: { 
            quiz_id: id, 
            subject: 'pending',
            score: 0,
            time_taken: 0,
            questions_correct: 0,
            questions_total: 0,
            completed_at: new Date(),
            _claimed: true // Mark as claimed but not yet scored
          } 
        },
        $setOnInsert: { user_id: req.user.id }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: false // Skip validation for the placeholder
      }
    );
    
    // If we couldn't claim (quiz already exists), reject
    if (!claimResult) {
      return res.status(400).json({
        success: false,
        message: "You have already completed this quiz. You can only review your previous attempt."
      });
    }

    // Get the quiz with questions (including choices for is_correct check)
    const quiz = await Quiz.findById(id)
      .populate({
        path: 'questions',
        select: 'correctAnswer subject choices question_text title explanation'
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Calculate score
    let questionsCorrect = 0;
    const results = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[question._id.toString()];
      
      // Check correctness using multiple methods:
      // 1. Direct match with correctAnswer field
      // 2. Match choice text with is_correct=true
      // 3. Match choice id with is_correct=true
      let isCorrect = false;
      let correctAnswerText = question.correctAnswer;
      
      if (question.correctAnswer && userAnswer === question.correctAnswer) {
        isCorrect = true;
      } else if (question.choices && question.choices.length > 0) {
        const correctChoice = question.choices.find(c => c.is_correct);
        correctAnswerText = correctChoice?.text || correctAnswerText;
        
        // Check if user answer matches correct choice text or id
        if (correctChoice) {
          isCorrect = userAnswer === correctChoice.text || 
                      userAnswer === correctChoice.id ||
                      userAnswer === correctChoice._id?.toString();
        }
      }
      
      if (isCorrect) {
        questionsCorrect++;
      }

      results.push({
        questionId: question._id,
        questionTitle: question.title,
        questionText: question.question_text,
        userAnswer,
        correctAnswer: correctAnswerText,
        isCorrect,
        explanation: question.explanation
      });
    });

    const questionsTotal = quiz.questions.length;
    const scorePercentage = Math.round((questionsCorrect / questionsTotal) * 100);

    // Check if this is user's first quiz
    const isFirstQuiz = !claimResult || claimResult.total_quizzes_completed === 0;

    // Update user progress
    const progressUpdate = await updateUserProgress(req.user.id, {
      subject: quiz.subject,
      questionsCorrect,
      questionsTotal,
      timeTaken,
      quizId: quiz._id,
      isFirstQuiz
    });

    // Store the results in user progress for later review
    await UserProgress.findOneAndUpdate(
      { user_id: req.user.id, 'quiz_attempts.quiz_id': quiz._id },
      { $set: { 'quiz_attempts.$.results': results } }
    );

    res.json({
      success: true,
      data: {
        score: scorePercentage,
        questionsCorrect,
        questionsTotal,
        timeTaken,
        results,
        progressUpdate: {
          xpEarned: progressUpdate.xpEarned,
          newLevel: progressUpdate.newLevel,
          currentStreak: progressUpdate.currentStreak,
          totalXP: progressUpdate.totalXP
        }
      },
      message: `Quiz completed! Score: ${scorePercentage}%`
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get quiz review for a completed quiz
export const getQuizReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user's attempt for this quiz
    const UserProgress = (await import("../models/userProgress.model.js")).default;
    const progress = await UserProgress.findOne({ user_id: req.user.id });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No quiz attempts found"
      });
    }
    
    const attempt = progress.quiz_attempts.find(qa => qa.quiz_id?.toString() === id);
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "You haven't taken this quiz yet"
      });
    }
    
    // Get quiz with full question details
    const quiz = await Quiz.findById(id)
      .populate({
        path: 'questions',
        select: 'title question_text subject difficulty choices explanation'
      });
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }
    
    // Build review data
    const reviewData = {
      quizId: quiz._id,
      quizTitle: quiz.title,
      subject: quiz.subject,
      completedAt: attempt.completed_at,
      score: attempt.score,
      questionsCorrect: attempt.questions_correct,
      questionsTotal: attempt.questions_total,
      timeTaken: attempt.time_taken,
      questions: quiz.questions.map(q => {
        // Find the correct answer
        const correctChoice = q.choices?.find(c => c.is_correct);
        return {
          id: q._id,
          title: q.title,
          question: q.question_text,
          difficulty: q.difficulty,
          explanation: q.explanation,
          choices: q.choices?.map(c => ({
            id: c.id || c._id?.toString(),
            text: c.text,
            isCorrect: c.is_correct
          })),
          correctAnswer: correctChoice?.text
        };
      })
    };
    
    res.json({
      success: true,
      data: reviewData
    });
    
  } catch (error) {
    console.error("Error getting quiz review:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};