import Question from "../models/question.model.js";

// @desc   Add a new question
// @route  POST /api/questions
// @access Private (admin only)
export const addQuestion = async (req, res) => {
  try {
    const { subject, source, text, options, correctAnswer, explanation, difficulty } = req.body;

    if (!subject || !source || !text || !correctAnswer) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const question = await Question.create({
      subject,
      source,
      text,
      options,
      correctAnswer,
      explanation,
      difficulty,
      createdBy: req.user._id,
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all questions (with pagination, filters, search)
// @route  GET /api/questions
// @access Public
export const getQuestions = async (req, res) => {
  try {
    const { subject, source, difficulty, keyword, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (subject) filter.subject = subject;
    if (source) filter.source = source;
    if (difficulty) filter.difficulty = difficulty;

    if (keyword) {
      filter.text = { $regex: keyword, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await Question.find(filter)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get single question
// @route  GET /api/questions/:id
// @access Public
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update question
// @route  PUT /api/questions/:id
// @access Private (admin or creator)
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    // Allow creator or admin
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete question
// @route  DELETE /api/questions/:id
// @access Private (admin or creator)
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    await question.deleteOne();
    res.json({ message: "Question removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Search questions
// @route  GET /api/questions/search/:keyword
// @access Public
export const searchQuestions = async (req, res) => {
  try {
    const keyword = req.params.keyword
      ? { text: { $regex: req.params.keyword, $options: "i" } }
      : {};

    const questions = await Question.find(keyword).limit(50); // limit results
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get random question
// @route  GET /api/questions/random
// @access Public
export const getRandomQuestion = async (req, res) => {
  try {
    const count = await Question.countDocuments();
    const random = Math.floor(Math.random() * count);
    const question = await Question.findOne().skip(random);
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Bulk add questions
// @route  POST /api/questions/bulk
// @access Private (admin)
export const addMultipleQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Please provide an array of questions" });
    }

    const created = await Question.insertMany(
      questions.map((q) => ({ ...q, createdBy: req.user._id }))
    );

    res.status(201).json({ message: `${created.length} questions added`, created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
