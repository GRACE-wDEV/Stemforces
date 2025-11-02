import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";

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

    const quiz = await Quiz.findById(id)
      .populate('created_by', 'name email')
      .populate('questions', 'title subject difficulty question_text choices explanation');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    res.json({
      success: true,
      data: quiz
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