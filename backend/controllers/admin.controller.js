import Question from "../models/question.model.js";
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

// @desc   Get admin dashboard stats
// @route  GET /api/admin/dashboard/stats
// @access Private (admin only)
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalQuestions,
      publishedQuestions,
      draftQuestions,
      recentQuestions,
      questionsBySubject,
      questionsByDifficulty
    ] = await Promise.all([
      Question.countDocuments({ deleted_at: null }),
      Question.countDocuments({ published: true, deleted_at: null }),
      Question.countDocuments({ published: false, deleted_at: null }),
      Question.find({ deleted_at: null })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('created_by', 'name email')
        .select('title subject difficulty createdAt'),
      Question.aggregate([
        { $match: { deleted_at: null } },
        { $group: { _id: "$subject", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Question.aggregate([
        { $match: { deleted_at: null } },
        { $group: { _id: "$difficulty", count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      stats: {
        total_questions: totalQuestions,
        published_questions: publishedQuestions,
        draft_questions: draftQuestions,
      },
      recent_questions: recentQuestions,
      questions_by_subject: questionsBySubject,
      questions_by_difficulty: questionsByDifficulty
    });
  } catch (error) {
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