import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import AuditLog from "../models/auditLog.model.js";

// Utility function to log actions
const logAction = async (userId, actionType, resourceType, resourceId, changes = {}, metadata = {}) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action_type: actionType,
      resource_type: resourceType,
      resource_id: resourceId,
      changes,
      metadata
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
};

// @desc   Get all quizzes for admin
// @route  GET /api/admin/quizzes
// @access Private (admin/editor)
export const getAdminQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, published, created_by, subject, category } = req.query;

    let filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    if (published !== undefined) filter.published = published === 'true';
    if (created_by) filter.created_by = created_by;
    if (subject) filter.subject = subject;
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

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
      quizzes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Create new quiz
// @route  POST /api/admin/quizzes
// @access Private (admin/editor)
export const createAdminQuiz = async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      created_by: req.user._id
    };

    // If rules are provided, generate questions based on rules
    if (quizData.rules && Object.keys(quizData.rules).length > 0) {
      const questions = await generateQuestionsFromRules(quizData.rules);
      quizData.questions = questions.map(q => q._id);
    }

    const quiz = await Quiz.create(quizData);
    await quiz.populate(['created_by', 'questions']);

    // Log the action
    await logAction(
      req.user._id,
      "CREATE",
      "Quiz",
      quiz._id,
      { after: quiz.toObject() },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    // Update user stats
    await req.user.updateOne({ $inc: { quizzes_created: 1 } });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update quiz
// @route  PUT /api/admin/quizzes/:id
// @access Private (admin/editor)
export const updateAdminQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    const canEdit = req.user.role === "admin" || 
                   quiz.created_by.toString() === req.user._id.toString();
    
    if (!canEdit) {
      return res.status(403).json({ message: "Not authorized to edit this quiz" });
    }

    const beforeData = quiz.toObject();

    // If rules are updated, regenerate questions
    if (req.body.rules && Object.keys(req.body.rules).length > 0) {
      const questions = await generateQuestionsFromRules(req.body.rules);
      req.body.questions = questions.map(q => q._id);
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate(['created_by', 'questions']);

    // Log the action
    await logAction(
      req.user._id,
      "UPDATE",
      "Quiz",
      quiz._id,
      { before: beforeData, after: updatedQuiz.toObject() },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete quiz
// @route  DELETE /api/admin/quizzes/:id
// @access Private (admin/editor)
export const deleteAdminQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    const canDelete = req.user.role === "admin" || 
                     quiz.created_by.toString() === req.user._id.toString();
    
    if (!canDelete) {
      return res.status(403).json({ message: "Not authorized to delete this quiz" });
    }

    const beforeData = quiz.toObject();
    await Quiz.findByIdAndDelete(req.params.id);

    // Log the action
    await logAction(
      req.user._id,
      "DELETE",
      "Quiz",
      quiz._id,
      { before: beforeData },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Publish/Unpublish quiz
// @route  PATCH /api/admin/quizzes/:id/publish
// @access Private (admin/editor)
export const toggleQuizPublish = async (req, res) => {
  try {
    const { published } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check permissions
    const canPublish = req.user.role === "admin" || 
                      quiz.created_by.toString() === req.user._id.toString();
    
    if (!canPublish) {
      return res.status(403).json({ message: "Not authorized to publish this quiz" });
    }

    const beforeData = quiz.toObject();
    quiz.published = published;
    await quiz.save();
    await quiz.populate(['created_by', 'questions']);

    // Log the action
    await logAction(
      req.user._id,
      published ? "PUBLISH" : "UNPUBLISH",
      "Quiz",
      quiz._id,
      { before: beforeData, after: quiz.toObject() },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get quiz with full details including questions
// @route  GET /api/admin/quizzes/:id
// @access Private (admin/editor)
export const getAdminQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('created_by', 'name email')
      .populate({
        path: 'questions',
        populate: {
          path: 'created_by',
          select: 'name email'
        }
      });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate questions based on rules
const generateQuestionsFromRules = async (rules) => {
  try {
    let filter = { deleted_at: null, published: true };
    
    if (rules.subject) filter.subject = rules.subject;
    if (rules.difficulty) filter.difficulty = rules.difficulty;
    if (rules.tags && rules.tags.length > 0) {
      filter.tags = { $in: rules.tags };
    }

    let query = Question.find(filter);
    
    if (rules.randomize) {
      // Use MongoDB aggregation for random sampling
      const questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: rules.count || 10 } }
      ]);
      return questions;
    } else {
      const questions = await query
        .limit(rules.count || 10)
        .sort({ createdAt: -1 });
      return questions;
    }
  } catch (error) {
    console.error("Error generating questions from rules:", error);
    return [];
  }
};