import express from 'express';
import { 
  chatWithTutor,
  explainAnswer,
  getHint,
  generateQuestions,
  getStudyRecommendations,
  generateBattleQuestions,
  breakdownConcept,
  generateDailyChallenge,
  validateApiKey,
  checkApiKeyStatus
} from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Check if user has API key configured
router.get('/status', protect, checkApiKeyStatus);

// Validate an API key before saving
router.post('/validate-key', protect, validateApiKey);

// AI Tutor chat (protected - need to be logged in)
router.post('/chat', protect, chatWithTutor);

// Explain wrong answer
router.post('/explain', protect, explainAnswer);

// Get hint for a question
router.post('/hint', protect, getHint);

// Generate practice questions
router.post('/generate-questions', protect, generateQuestions);

// Get personalized study recommendations
router.post('/study-recommendations', protect, getStudyRecommendations);

// Generate battle questions
router.post('/battle-questions', protect, generateBattleQuestions);

// Break down a concept
router.post('/breakdown', protect, breakdownConcept);

// Generate daily challenge (admin only)
router.post('/daily-challenge', protect, generateDailyChallenge);

export default router;
