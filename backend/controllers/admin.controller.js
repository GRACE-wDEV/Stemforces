import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import UserProgress from "../models/userProgress.model.js";
import AuditLog from "../models/auditLog.model.js";
import { v4 as uuidv4 } from "uuid";

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

// @desc   Get comprehensive admin dashboard stats
// @route  GET /api/admin/dashboard/stats
// @access Private (admin only)
export const getDashboardStats = async (req, res) => {
  try {
    // ── Core counts ──
    const [
      totalQuestions,
      publishedQuestions,
      draftQuestions,
      totalQuizzes,
      publishedQuizzes,
      totalUsers,
      activeUsers,
      adminCount,
      editorCount,
    ] = await Promise.all([
      Question.countDocuments({ deleted_at: null }),
      Question.countDocuments({ published: true, deleted_at: null }),
      Question.countDocuments({ published: false, deleted_at: null }),
      Quiz.countDocuments({}),
      Quiz.countDocuments({ published: true }),
      User.countDocuments({}),
      User.countDocuments({ active: true }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "editor" }),
    ]);

    // ── Aggregations (parallel) ──
    const [
      questionsBySubject,
      questionsByDifficulty,
      quizzesBySubject,
      recentQuestions,
      recentQuizzes,
      recentUsers,
      topQuizzes,
      subjectsFromDB,
      categoryCounts,
      dailyActivityAgg,
      userGrowthAgg,
    ] = await Promise.all([
      // Questions per subject
      Question.aggregate([
        { $match: { deleted_at: null } },
        { $group: { _id: "$subject", count: { $sum: 1 }, published: { $sum: { $cond: ["$published", 1, 0] } } } },
        { $sort: { count: -1 } },
      ]),
      // Questions per difficulty
      Question.aggregate([
        { $match: { deleted_at: null } },
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      ]),
      // Quizzes per subject
      Quiz.aggregate([
        { $group: { _id: "$subject", count: { $sum: 1 }, totalAttempts: { $sum: "$attempts" }, avgScore: { $avg: "$avg_score" } } },
        { $sort: { count: -1 } },
      ]),
      // Recent questions
      Question.find({ deleted_at: null })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("created_by", "name email")
        .select("title subject difficulty createdAt published question_text"),
      // Recent quizzes
      Quiz.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("created_by", "name email")
        .select("title subject published attempts avg_score createdAt questions"),
      // Recent users
      User.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select("name email role active createdAt last_login"),
      // Top quizzes by attempts
      Quiz.find({ published: true })
        .sort({ attempts: -1 })
        .limit(5)
        .select("title subject attempts avg_score questions"),
      // Distinct subjects from questions (for merging with standard list)
      Question.distinct("subject", { deleted_at: null }),
      // Category counts per subject
      Category.aggregate([
        { $group: { _id: "$subject", count: { $sum: 1 } } },
      ]),
      // Daily activity for the past 30 days (from UserProgress)
      UserProgress.aggregate([
        { $unwind: "$daily_activity" },
        { $match: { "daily_activity.date": { $gte: new Date(Date.now() - 30 * 86400000) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$daily_activity.date" } },
            questions: { $sum: "$daily_activity.questions_answered" },
            time: { $sum: "$daily_activity.time_spent" },
            xp: { $sum: "$daily_activity.xp_gained" },
            users: { $addToSet: "$user_id" },
          },
        },
        { $project: { _id: 1, questions: 1, time: 1, xp: 1, activeUsers: { $size: "$users" } } },
        { $sort: { _id: 1 } },
      ]),
      // User sign-up growth last 30 days
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // ── Platform-wide totals from UserProgress ──
    let platformTotals = { questionsAnswered: 0, quizzesCompleted: 0, timeSpent: 0, totalXP: 0 };
    try {
      const [agg] = await UserProgress.aggregate([
        {
          $group: {
            _id: null,
            questionsAnswered: { $sum: "$total_questions_attempted" },
            quizzesCompleted: { $sum: "$total_quizzes_completed" },
            timeSpent: { $sum: "$total_time_spent" },
            totalXP: { $sum: "$total_xp" },
          },
        },
      ]);
      if (agg) platformTotals = agg;
    } catch { /* ok if collection empty */ }

    // ── Build subject metadata with icons ──
    const SUBJECT_META = {
      Math:           { icon: "📐", color: "#3b82f6" },
      Mathematics:    { icon: "📐", color: "#3b82f6" },
      Physics:        { icon: "⚡", color: "#8b5cf6" },
      Chemistry:      { icon: "🧪", color: "#10b981" },
      Biology:        { icon: "🧬", color: "#f59e0b" },
      English:        { icon: "📚", color: "#6366f1" },
      French:         { icon: "🇫🇷", color: "#ec4899" },
      Arabic:         { icon: "🌙", color: "#14b8a6" },
      Deutsch:        { icon: "🇩🇪", color: "#ef4444" },
      "Earth Science": { icon: "🌍", color: "#84cc16" },
      Geology:        { icon: "🌍", color: "#84cc16" },
    };

    // Standard subjects (always shown, matching home page)
    const standardSubjects = [
      'Math', 'Arabic', 'Physics', 'Chemistry', 'English',
      'Deutsch', 'Earth Science', 'French', 'Biology'
    ];

    // Merge: standard subjects + any extra DB-only subjects
    const allSubjectNames = [...new Set([...standardSubjects, ...subjectsFromDB])];

    const subjects = allSubjectNames.map((s) => ({
      id: s,
      name: s,
      icon: SUBJECT_META[s]?.icon || "📖",
      color: SUBJECT_META[s]?.color || "#64748b",
      questions: questionsBySubject.find((q) => q._id === s)?.count || 0,
      published: questionsBySubject.find((q) => q._id === s)?.published || 0,
      quizzes: quizzesBySubject.find((q) => q._id === s)?.count || 0,
      categories: categoryCounts.find((c) => c._id === s)?.count || 0,
    }));

    res.json({
      stats: {
        total_questions: totalQuestions,
        published_questions: publishedQuestions,
        draft_questions: draftQuestions,
        total_quizzes: totalQuizzes,
        published_quizzes: publishedQuizzes,
        total_users: totalUsers,
        active_users: activeUsers,
        admin_count: adminCount,
        editor_count: editorCount,
      },
      platform: {
        questions_answered: platformTotals.questionsAnswered,
        quizzes_completed: platformTotals.quizzesCompleted,
        time_spent_minutes: platformTotals.timeSpent,
        total_xp: platformTotals.totalXP,
      },
      subjects,
      questions_by_subject: questionsBySubject,
      questions_by_difficulty: questionsByDifficulty,
      quizzes_by_subject: quizzesBySubject,
      recent_questions: recentQuestions,
      recent_quizzes: recentQuizzes,
      recent_users: recentUsers,
      top_quizzes: topQuizzes,
      daily_activity: dailyActivityAgg,
      user_growth: userGrowthAgg,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get questions with advanced admin features
// @route  GET /api/admin/questions
// @access Private (admin/editor)
export const getAdminQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      subject, 
      difficulty, 
      published,
      tags,
      created_by,
      sort = "createdAt",
      order = "desc"
    } = req.query;

    // Build filter
    let filter = { deleted_at: null };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { question_text: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }
    
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (published !== undefined) filter.published = published === 'true';
    if (tags) filter.tags = { $in: tags.split(',') };
    if (created_by) filter.created_by = created_by;

    // Build sort
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('created_by', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Question.countDocuments(filter)
    ]);

    res.json({
      questions,
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

// @desc   Create question with full admin features
// @route  POST /api/admin/questions
// @access Private (admin/editor)
export const createAdminQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      created_by: req.user._id,
      version: 1
    };

    // Generate IDs for choices if not provided
    if (questionData.choices && questionData.choices.length > 0) {
      questionData.choices = questionData.choices.map(choice => ({
        ...choice,
        id: choice.id || uuidv4()
      }));
    }

    const question = await Question.create(questionData);
    await question.populate('created_by', 'name email');

    // Log the action
    await logAction(
      req.user._id,
      "CREATE",
      "Question",
      question._id,
      { after: question.toObject() },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    // Update user stats
    await req.user.updateOne({ $inc: { questions_created: 1 } });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update question with versioning
// @route  PUT /api/admin/questions/:id
// @access Private (admin/editor)
export const updateAdminQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ 
      _id: req.params.id, 
      deleted_at: null 
    });
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check permissions
    const canEdit = req.user.role === "admin" || 
                   question.created_by.toString() === req.user._id.toString();
    
    if (!canEdit) {
      return res.status(403).json({ message: "Not authorized to edit this question" });
    }

    const beforeData = question.toObject();
    
    // Update with version increment
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        version: question.version + 1 
      },
      { new: true }
    ).populate('created_by', 'name email');

    // Log the action
    await logAction(
      req.user._id,
      "UPDATE",
      "Question",
      question._id,
      { before: beforeData, after: updatedQuestion.toObject() },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Soft delete question
// @route  DELETE /api/admin/questions/:id
// @access Private (admin/editor)
export const deleteAdminQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ 
      _id: req.params.id, 
      deleted_at: null 
    });
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check permissions
    const canDelete = req.user.role === "admin" || 
                     question.created_by.toString() === req.user._id.toString();
    
    if (!canDelete) {
      return res.status(403).json({ message: "Not authorized to delete this question" });
    }

    const beforeData = question.toObject();
    
    // Soft delete
    question.deleted_at = new Date();
    await question.save();

    // Log the action
    await logAction(
      req.user._id,
      "DELETE",
      "Question",
      question._id,
      { before: beforeData },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Restore soft deleted question
// @route  POST /api/admin/questions/:id/restore
// @access Private (admin only)
export const restoreQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ 
      _id: req.params.id, 
      deleted_at: { $ne: null } 
    });
    
    if (!question) {
      return res.status(404).json({ message: "Deleted question not found" });
    }

    question.deleted_at = null;
    await question.save();
    await question.populate('created_by', 'name email');

    // Log the action
    await logAction(
      req.user._id,
      "RESTORE",
      "Question",
      question._id,
      { after: question.toObject() },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Bulk operations on questions
// @route  POST /api/admin/questions/bulk
// @access Private (admin)
export const bulkOperations = async (req, res) => {
  try {
    const { action, question_ids, data } = req.body;
    
    if (!question_ids || !Array.isArray(question_ids)) {
      return res.status(400).json({ message: "Invalid question IDs" });
    }

    let result = {};
    
    switch (action) {
      case "delete":
        result = await Question.updateMany(
          { _id: { $in: question_ids }, deleted_at: null },
          { deleted_at: new Date() }
        );
        break;
        
      case "publish":
        result = await Question.updateMany(
          { _id: { $in: question_ids }, deleted_at: null },
          { published: true }
        );
        break;
        
      case "unpublish":
        result = await Question.updateMany(
          { _id: { $in: question_ids }, deleted_at: null },
          { published: false }
        );
        break;
        
      case "update_difficulty":
        if (!data.difficulty) {
          return res.status(400).json({ message: "Difficulty is required" });
        }
        result = await Question.updateMany(
          { _id: { $in: question_ids }, deleted_at: null },
          { difficulty: data.difficulty }
        );
        break;
        
      case "add_tags":
        if (!data.tags || !Array.isArray(data.tags)) {
          return res.status(400).json({ message: "Tags array is required" });
        }
        result = await Question.updateMany(
          { _id: { $in: question_ids }, deleted_at: null },
          { $addToSet: { tags: { $each: data.tags } } }
        );
        break;
        
      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    // Log the bulk action
    await logAction(
      req.user._id,
      `BULK_${action.toUpperCase()}`,
      "Question",
      question_ids.join(","),
      { question_ids, data },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    res.json({ 
      message: `Bulk ${action} completed successfully`,
      modified_count: result.modifiedCount || result.matchedCount 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Import questions from CSV/JSON
// @route  POST /api/admin/questions/import
// @access Private (admin/editor)
export const importQuestions = async (req, res) => {
  try {
    const { questions, format = "json" } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid questions data" });
    }

    const importResults = {
      total: questions.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    const validQuestions = [];
    
    for (let i = 0; i < questions.length; i++) {
      try {
        const questionData = {
          ...questions[i],
          created_by: req.user._id,
          version: 1
        };

        // Validate required fields
        if (!questionData.title || !questionData.question_text || !questionData.subject || !questionData.difficulty) {
          throw new Error("Missing required fields");
        }

        // Generate IDs for choices
        if (questionData.choices && questionData.choices.length > 0) {
          questionData.choices = questionData.choices.map(choice => ({
            ...choice,
            id: choice.id || uuidv4()
          }));
        }

        validQuestions.push(questionData);
        importResults.successful++;
      } catch (error) {
        importResults.failed++;
        importResults.errors.push({
          row: i + 1,
          error: error.message
        });
      }
    }

    // Insert valid questions
    let insertedQuestions = [];
    if (validQuestions.length > 0) {
      insertedQuestions = await Question.insertMany(validQuestions);
    }

    // Log the import action
    await logAction(
      req.user._id,
      "BULK_IMPORT",
      "Question",
      null,
      { 
        import_results: importResults,
        format,
        question_count: validQuestions.length 
      },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );

    // Update user stats
    if (validQuestions.length > 0) {
      await req.user.updateOne({ $inc: { questions_created: validQuestions.length } });
    }

    res.json({
      ...importResults,
      questions: insertedQuestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Export questions to CSV/JSON
// @route  GET /api/admin/questions/export
// @access Private (admin/editor)
export const exportQuestions = async (req, res) => {
  try {
    const { 
      format = "json",
      subject,
      difficulty,
      published,
      include_deleted = false
    } = req.query;

    // Build filter
    let filter = {};
    if (!include_deleted) filter.deleted_at = null;
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (published !== undefined) filter.published = published === 'true';

    const questions = await Question.find(filter)
      .populate('created_by', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertQuestionsToCSV(questions);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=questions_export.csv');
      res.send(csv);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=questions_export.json');
      res.json(questions);
    }

    // Log the export action
    await logAction(
      req.user._id,
      "EXPORT",
      "Question",
      null,
      { filter, format, count: questions.length },
      { ip_address: req.ip, user_agent: req.get('User-Agent') }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to convert questions to CSV
const convertQuestionsToCSV = (questions) => {
  const headers = [
    'ID', 'Title', 'Question Text', 'Subject', 'Difficulty', 
    'Time Limit', 'Choices', 'Tags', 'Explanation', 'Published', 
    'Created By', 'Created At'
  ].join(',');

  const rows = questions.map(q => {
    const choices = q.choices?.map(c => `${c.text}|${c.is_correct}`).join(';') || '';
    const tags = q.tags?.join(';') || '';
    
    return [
      q._id,
      `"${q.title?.replace(/"/g, '""') || ''}"`,
      `"${q.question_text?.replace(/"/g, '""') || ''}"`,
      q.subject || '',
      q.difficulty || '',
      q.time_limit_seconds || '',
      `"${choices}"`,
      `"${tags}"`,
      `"${q.explanation?.replace(/"/g, '""') || ''}"`,
      q.published || false,
      q.created_by?.name || '',
      q.createdAt?.toISOString() || ''
    ].join(',');
  });

  return [headers, ...rows].join('\n');
};