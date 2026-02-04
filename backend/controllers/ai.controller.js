import geminiService from '../services/gemini.service.js';
import User from '../models/user.model.js';

/**
 * Helper to get user's Gemini API key
 */
const getUserApiKey = async (userId) => {
  const user = await User.findById(userId).select('+geminiApiKey');
  return user?.geminiApiKey || null;
};

// Chat with AI Tutor
export const chatWithTutor = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    const apiKey = await getUserApiKey(req.user.id);
    const result = await geminiService.chatWithTutor(apiKey, message, context || {});
    
    res.json({
      success: result.success,
      data: {
        message: result.message
      }
    });
  } catch (error) {
    console.error('Chat with tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response'
    });
  }
};

// Explain wrong answer
export const explainAnswer = async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer, options } = req.body;
    
    if (!question || userAnswer === undefined || correctAnswer === undefined || !options) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const apiKey = await getUserApiKey(req.user.id);
    const result = await geminiService.explainWrongAnswer(apiKey, question, userAnswer, correctAnswer, options);
    
    res.json({
      success: result.success,
      data: {
        explanation: result.explanation
      }
    });
  } catch (error) {
    console.error('Explain answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate explanation'
    });
  }
};

// Get hint for a question
export const getHint = async (req, res) => {
  try {
    const { question, options, correctAnswer } = req.body;
    if (!question || !options) {
      return res.status(400).json({
        success: false,
        data: { hint: null },
        message: 'Question and options are required'
      });
    }
    
    const apiKey = await getUserApiKey(req.user.id);
    const result = await geminiService.getHint(apiKey, question, options, correctAnswer);
    
    res.json({
      success: result.success,
      data: {
        hint: result.hint
      },
      message: result.error || undefined
    });
  } catch (error) {
    console.error('Get hint error:', error);
    res.status(500).json({
      success: false,
      data: { hint: null },
      message: 'Failed to generate hint'
    });
  }
};

// Generate practice questions
export const generateQuestions = async (req, res) => {
  try {
    const { subject, topic, count = 5, difficulty = 'medium' } = req.body;
    
    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Subject and topic are required'
      });
    }
    
    const apiKey = await getUserApiKey(req.user.id);
    
    // Generate multiple questions
    const questions = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const result = await geminiService.generateQuestion(apiKey, subject, topic, difficulty);
      if (result.success && result.question) {
        questions.push(result.question);
      }
    }
    
    res.json({
      success: questions.length > 0,
      data: {
        questions,
        generated: questions.length,
        requested: count
      }
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions'
    });
  }
};

// Get study recommendations
export const getStudyRecommendations = async (req, res) => {
  try {
    const performanceData = req.body;
    
    const apiKey = await getUserApiKey(req.user.id);
    const result = await geminiService.getStudyRecommendations(apiKey, performanceData);
    
    res.json({
      success: result.success,
      data: {
        recommendations: result.recommendations
      }
    });
  } catch (error) {
    console.error('Study recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get study recommendations'
    });
  }
};

// Generate battle questions (uses same generate logic)
export const generateBattleQuestions = async (req, res) => {
  try {
    const { subject, count = 5 } = req.body;
    
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }
    
    const apiKey = await getUserApiKey(req.user.id);
    
    const questions = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      const result = await geminiService.generateQuestion(apiKey, subject, 'mixed topics', 'medium');
      if (result.success && result.question) {
        questions.push({
          ...result.question,
          timeLimit: 20
        });
      }
    }
    
    res.json({
      success: questions.length > 0,
      data: {
        questions
      }
    });
  } catch (error) {
    console.error('Generate battle questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate battle questions'
    });
  }
};

// Break down a concept
export const breakdownConcept = async (req, res) => {
  try {
    const { concept, subject } = req.body;
    
    if (!concept) {
      return res.status(400).json({
        success: false,
        message: 'Concept is required'
      });
    }
    
    const apiKey = await getUserApiKey(req.user.id);
    const result = await geminiService.chatWithTutor(
      apiKey, 
      `Please break down this concept in detail: ${concept} (Subject: ${subject || 'General'})`,
      {}
    );
    
    res.json({
      success: result.success,
      data: {
        message: result.message
      }
    });
  } catch (error) {
    console.error('Breakdown concept error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to break down concept'
    });
  }
};

// Generate daily challenge (simplified - uses generate question)
export const generateDailyChallenge = async (req, res) => {
  try {
    const { subjects } = req.body;
    
    const apiKey = await getUserApiKey(req.user.id);
    
    const questions = [];
    const subjectList = subjects || ['Math', 'Physics', 'Chemistry'];
    
    for (const subject of subjectList.slice(0, 3)) {
      const result = await geminiService.generateQuestion(apiKey, subject, 'mixed', 'medium');
      if (result.success && result.question) {
        questions.push(result.question);
      }
    }
    
    res.json({
      success: questions.length > 0,
      data: {
        questions
      }
    });
  } catch (error) {
    console.error('Generate daily challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily challenge'
    });
  }
};

// Validate API key
export const validateApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    const result = await geminiService.validateApiKey(apiKey);
    
    res.json({
      success: result.valid,
      message: result.valid ? 'API key is valid' : result.error
    });
  } catch (error) {
    console.error('Validate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate API key'
    });
  }
};

// Check if user has API key configured
export const checkApiKeyStatus = async (req, res) => {
  try {
    const apiKey = await getUserApiKey(req.user.id);
    
    res.json({
      success: true,
      data: {
        hasApiKey: !!apiKey,
        message: apiKey 
          ? 'Gemini API key is configured' 
          : 'No API key configured. Add your Gemini API key in profile settings.'
      }
    });
  } catch (error) {
    console.error('Check API key status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check API key status'
    });
  }
};
