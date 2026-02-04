import Category from "../models/category.model.js";
import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";

// @desc   Get all categories (optionally filtered by subject)
// @route  GET /api/admin/categories
// @access Private (admin/editor)
export const getCategories = async (req, res) => {
  try {
    const { subject } = req.query;
    
    const filter = {};
    if (subject) filter.subject = subject;
    
    const categories = await Category.find(filter)
      .sort({ subject: 1, order: 1, name: 1 })
      .populate('created_by', 'name');
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get categories for a subject (for frontend browsing)
// @route  GET /api/categories/browse?subject=Math
// @access Public
export const getCategoriesBySubject = async (req, res) => {
  try {
    const { subject } = req.query;
    
    // Build filter
    const filter = { active: true };
    if (subject) {
      filter.subject = subject;
    }
    
    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 });
    
    // Return categories array for the specific subject
    res.json({
      success: true,
      categories: categories.map(cat => ({
        _id: cat._id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        subject: cat.subject,
        quizCount: cat.quizCount || 0,
        questionCount: cat.questionCount || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single category with quizzes
// @route  GET /api/categories/:id
// @access Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    // Get quizzes in this category
    const quizzes = await Quiz.find({ 
      category: category._id, 
      published: true 
    })
      .select('title description total_time questions attempts avg_score')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      category,
      quizzes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create a new category
// @route  POST /api/admin/categories
// @access Private (admin/editor)
export const createCategory = async (req, res) => {
  try {
    const { name, description, subject, icon, color, order } = req.body;
    
    if (!name || !subject) {
      return res.status(400).json({ 
        success: false, 
        message: "Name and subject are required" 
      });
    }
    
    // Check for duplicate
    const existing = await Category.findOne({ name, subject });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: "A category with this name already exists in this subject" 
      });
    }
    
    const category = await Category.create({
      name,
      description,
      subject,
      icon: icon || "Folder",
      color: color || "#6366f1",
      order: order || 0,
      created_by: req.user._id
    });
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update a category
// @route  PUT /api/admin/categories/:id
// @access Private (admin/editor)
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, color, order, active } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (order !== undefined) category.order = order;
    if (active !== undefined) category.active = active;
    
    await category.save();
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete a category
// @route  DELETE /api/admin/categories/:id
// @access Private (admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    // Remove category reference from questions and quizzes
    await Question.updateMany(
      { category: category._id },
      { $unset: { category: "" } }
    );
    
    await Quiz.updateMany(
      { category: category._id },
      { $unset: { category: "" } }
    );
    
    await category.deleteOne();
    
    res.json({
      success: true,
      message: "Category deleted"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update category stats (called after question/quiz changes)
// @access Internal
export const updateCategoryStats = async (categoryId) => {
  try {
    if (!categoryId) return;
    
    const [questionCount, quizCount] = await Promise.all([
      Question.countDocuments({ category: categoryId, deleted_at: null }),
      Quiz.countDocuments({ category: categoryId })
    ]);
    
    await Category.findByIdAndUpdate(categoryId, {
      questionCount,
      quizCount
    });
  } catch (error) {
    console.error("Error updating category stats:", error);
  }
};
