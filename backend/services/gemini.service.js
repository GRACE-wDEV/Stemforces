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
 * Create a Gemini client with user's API key
 */
const createGeminiClient = (apiKey) => {
  if (!apiKey) {
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash - fast, efficient, and currently available
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
      message: 'Please add your Gemini API key in your profile settings to use AI features. Get a free key at https://aistudio.google.com/apikey'
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
      explanation: 'Please add your Gemini API key in your profile to get AI explanations.'
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
      hint: 'Add your Gemini API key in profile settings for AI hints.'
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
      recommendations: 'Please add your Gemini API key in your profile settings to get personalized study recommendations. Get a free key at https://aistudio.google.com/apikey'
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
      error: 'API key required'
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
 * Validate an API key by making a simple request
 */
export const validateApiKey = async (apiKey) => {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: 'Invalid API key format' };
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash - fast and efficient model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Make a simple request to validate
    const result = await model.generateContent('Say "OK" in one word');
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      return { valid: true };
    }
    return { valid: false, error: 'Unexpected response' };
  } catch (error) {
    console.error('API Key validation error:', error);
    return { 
      valid: false, 
      error: error.message?.includes('API_KEY_INVALID') 
        ? 'Invalid API key' 
        : 'Failed to validate key'
    };
  }
};

export default {
  chatWithTutor,
  explainWrongAnswer,
  getHint,
  getStudyRecommendations,
  generateQuestion,
  validateApiKey
};
