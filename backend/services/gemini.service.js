/**
 * Gemini AI Service - BYOK (Bring Your Own Key)
 * Uses user's personal Gemini API key from their profile
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// System prompts for different AI features
const SYSTEM_PROMPTS = {
  tutor: `You are an expert STEM tutor for students. Your role is to:
- Explain concepts clearly and concisely
- Use simple language but be academically accurate
- Provide examples when helpful
- Encourage students and make learning fun
- If a student is struggling, break down concepts into smaller parts
- Use LaTeX for math equations (wrap in $ for inline, $$ for block)
- Keep responses focused and not too long (max 300 words unless explaining complex topics)
- Be encouraging and positive`,

  explainWrong: `You are a helpful STEM tutor explaining why an answer was incorrect. Your role is to:
- Explain why the chosen answer is wrong
- Explain why the correct answer is right
- Help the student understand the underlying concept
- Use LaTeX for math ($ for inline, $$ for block)
- Be encouraging - mistakes are learning opportunities
- Keep it concise (max 200 words)`,

  generateQuestion: `You are an expert question generator for STEM subjects. Generate high-quality multiple choice questions.
Return ONLY valid JSON in this exact format:
{
  "question": "The question text (use LaTeX with $ for math)",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of the correct answer",
  "difficulty": "easy|medium|hard",
  "topic": "specific topic name"
}
Do not include any text before or after the JSON.`,

  hint: `You are a helpful tutor providing hints. Your role is to:
- Give a helpful hint WITHOUT revealing the answer
- Guide the student's thinking in the right direction
- Be brief (1-2 sentences max)
- Make them think, don't just give it away`,

  studyRecommendations: `You are an educational advisor. Analyze the student's performance data and provide personalized study recommendations.
- Identify weak areas based on the data
- Suggest specific topics to focus on
- Provide actionable study tips
- Be encouraging and supportive
- Format your response in markdown with clear sections
- Keep it concise but helpful (max 400 words)`,

  conceptBreakdown: `Break down a complex STEM concept into simple, digestible parts.
- Use analogies students can relate to
- Build from simple to complex
- Include examples
- Use LaTeX for math ($)
- Make it engaging and memorable`
};

/**
 * Create a Gemini client with user's API key or fallback to server key
 */
const createGeminiClient = (apiKey) => {
  // Use user's API key if provided, otherwise fall back to server key
  const keyToUse = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (!keyToUse) {
    console.warn('No Gemini API key available (user or server)');
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(keyToUse);
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  } catch (error) {
    console.error('Failed to create Gemini client:', error);
    return null;
  }
};

/**
 * Chat with AI Tutor
 */
export const chatWithTutor = async (apiKey, message, context = {}) => {
  const model = createGeminiClient(apiKey);
  
  if (!model) {
    return {
      success: false,
      message: 'AI is currently unavailable. Please try again later.'
    };
  }
  
  try {
    const prompt = `${SYSTEM_PROMPTS.tutor}\n\nStudent's message: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      success: true,
      message: response.text()
    };
  } catch (error) {
    console.error('Gemini Tutor Error:', error);
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return {
        success: false,
        message: 'Your Gemini API key is invalid. Please check your key in profile settings.'
      };
    }
    
    return {
      success: false,
      message: 'AI is temporarily unavailable. Please try again later.',
      error: error.message
    };
  }
};

/**
 * Explain why an answer was wrong
 */
export const explainWrongAnswer = async (apiKey, question, userAnswer, correctAnswer, options) => {
  const model = createGeminiClient(apiKey);
  
  if (!model) {
    return {
      success: false,
      explanation: 'AI is currently unavailable. Please try again later.'
    };
  }
  
  try {
    const prompt = `${SYSTEM_PROMPTS.explainWrong}

Question: ${question}
Student's Answer: ${options[userAnswer]} (Option ${String.fromCharCode(65 + userAnswer)})
Correct Answer: ${options[correctAnswer]} (Option ${String.fromCharCode(65 + correctAnswer)})

Please explain why the student's answer was wrong and why the correct answer is right:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      success: true,
      explanation: response.text()
    };
  } catch (error) {
    console.error('Gemini Explain Error:', error);
    return {
      success: false,
      explanation: 'Failed to generate explanation. Please try again.',
      error: error.message
    };
  }
};

/**
 * Get a hint for a question
 */
export const getHint = async (apiKey, question, options, correctAnswer) => {
  const model = createGeminiClient(apiKey);
  
  if (!model) {
    return {
      success: false,
      hint: 'AI is currently unavailable. Please try again later.'
    };
  }
  
  try {
    const prompt = `${SYSTEM_PROMPTS.hint}

Question: ${question}
Options: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(', ')}

Give a helpful hint without revealing the answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      success: true,
      hint: response.text()
    };
  } catch (error) {
    console.error('Gemini Hint Error:', error);
    return {
      success: false,
      hint: 'Failed to generate hint.',
      error: error.message
    };
  }
};

/**
 * Get study recommendations based on performance
 */
export const getStudyRecommendations = async (apiKey, performanceData) => {
  const model = createGeminiClient(apiKey);
  
  if (!model) {
    return {
      success: false,
      recommendations: 'AI is currently unavailable. Please try again later.'
    };
  }
  
  try {
    const prompt = `${SYSTEM_PROMPTS.studyRecommendations}

Student Performance Data:
- Subjects studied: ${performanceData.subjects?.join(', ') || 'Not specified'}
- Overall accuracy: ${performanceData.accuracy || 0}%
- Questions answered: ${performanceData.questionsAnswered || 0}
- Weak topics: ${performanceData.weakTopics?.join(', ') || 'None identified yet'}
- Strong topics: ${performanceData.strongTopics?.join(', ') || 'None identified yet'}

Based on this data, provide personalized study recommendations:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      success: true,
      recommendations: response.text()
    };
  } catch (error) {
    console.error('Gemini Recommendations Error:', error);
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      return {
        success: false,
        recommendations: 'Your Gemini API key appears to be invalid. Please check it in your profile settings.'
      };
    }
    
    return {
      success: false,
      recommendations: 'Failed to generate recommendations. Please try again.',
      error: error.message
    };
  }
};

/**
 * Generate a question
 */
export const generateQuestion = async (apiKey, subject, topic, difficulty) => {
  const model = createGeminiClient(apiKey);
  
  if (!model) {
    return {
      success: false,
      error: 'AI is currently unavailable'
    };
  }
  
  try {
    const prompt = `${SYSTEM_PROMPTS.generateQuestion}

Generate a ${difficulty} difficulty question about ${topic} in ${subject}:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const questionData = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        question: questionData
      };
    }
    
    return {
      success: false,
      error: 'Failed to parse question format'
    };
  } catch (error) {
    console.error('Gemini Generate Question Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate multiple battle questions in a single API call (batch)
 */
export const generateBattleQuestionsBatch = async (apiKey, subject, difficulty, count) => {
  const model = createGeminiClient(apiKey);
  
  if (!model) {
    return { success: false, error: 'AI is currently unavailable' };
  }
  
  try {
    const prompt = `Generate exactly ${count} unique ${difficulty} difficulty multiple choice questions about ${subject}.

Return ONLY a valid JSON array (no extra text). Each element must have this exact format:
[
  {
    "question": "Question text (use LaTeX with $ for math)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation",
    "difficulty": "${difficulty}",
    "topic": "specific topic"
  }
]

Rules:
- Exactly ${count} questions
- Each question has exactly 4 options
- correctAnswer is the 0-based index of the correct option
- Questions should be diverse across different topics within ${subject}
- Return ONLY the JSON array, nothing else`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      if (Array.isArray(questions) && questions.length > 0) {
        return {
          success: true,
          questions: questions.map(q => ({
            question: q.question || 'Question',
            options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
            correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
            explanation: q.explanation || '',
            difficulty: q.difficulty || difficulty,
            topic: q.topic || subject,
            timeLimit: 20
          }))
        };
      }
    }
    
    return { success: false, error: 'Failed to parse batch questions' };
  } catch (error) {
    console.error('Gemini Batch Question Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validate an API key by making a simple request
 */
export const validateApiKey = async (apiKey) => {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: 'Invalid API key format' };
  }
  
  try {
    // Lightweight validation: list models (no tokens consumed)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    
    if (res.ok) {
      return { valid: true };
    }
    
    const data = await res.json().catch(() => null);
    const reason = data?.error?.details?.find(d => d.reason)?.reason;
    const msg = data?.error?.message || 'Unknown error';
    
    if (reason === 'API_KEY_INVALID' || res.status === 400) {
      return { valid: false, error: 'Invalid API key. Make sure you copied the full key from Google AI Studio.' };
    }
    if (res.status === 403) {
      return { valid: false, error: 'API key does not have permission. Enable the Generative Language API in your Google Cloud console.' };
    }
    return { valid: false, error: msg };
  } catch (error) {
    console.error('API Key validation error:', error);
    return { 
      valid: false, 
      error: 'Network error while validating key. Please try again.'
    };
  }
};

export default {
  chatWithTutor,
  explainWrongAnswer,
  getHint,
  getStudyRecommendations,
  generateQuestion,
  generateBattleQuestionsBatch,
  validateApiKey
};
