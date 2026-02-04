import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
let genAI = null;
let model = null;

const initializeAI = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ No Gemini API key found. AI features will be disabled.');
    console.warn('Set GEMINI_API_KEY in your environment variables.');
    return false;
  }
  
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Gemini AI initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini AI:', error.message);
    return false;
  }
};

// Initialize on module load
initializeAI();

// Check if AI is available
const isAIAvailable = () => {
  if (!model) {
    // Try to reinitialize
    initializeAI();
  }
  return !!model;
};

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

  studyPath: `You are an educational advisor. Analyze the student's performance data and suggest:
- What topics they should focus on
- Specific areas of weakness to improve
- A personalized study plan
Return as JSON: { "weakAreas": [], "recommendations": [], "nextSteps": [] }`,

  conceptBreakdown: `Break down a complex STEM concept into simple, digestible parts.
- Use analogies students can relate to
- Build from simple to complex
- Include examples
- Use LaTeX for math ($)
- Make it engaging and memorable`
};

// Helper function to generate content with error handling
const generateContent = async (prompt, maxRetries = 2) => {
  if (!isAIAvailable()) {
    throw new Error('AI is not configured. Please set GEMINI_API_KEY environment variable.');
  }

  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      console.error(`AI attempt ${i + 1} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.message?.includes('API_KEY') || error.message?.includes('PERMISSION')) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// AI Tutor - Chat with students
export const chatWithTutor = async (message, context = {}) => {
  try {
    const prompt = `${SYSTEM_PROMPTS.tutor}

${context.subject ? `Subject: ${context.subject}` : ''}
${context.topic ? `Topic: ${context.topic}` : ''}

Student's question: ${message}

Provide a helpful response:`;

    const response = await generateContent(prompt);
    return {
      success: true,
      message: response
    };
  } catch (error) {
    console.error('Gemini Tutor Error:', error);
    return {
      success: false,
      message: 'AI tutor is temporarily unavailable. Please try again later.',
      error: error.message
    };
  }
};

// Explain why an answer was wrong
export const explainWrongAnswer = async (question, userAnswer, correctAnswer, options = []) => {
  try {
    const userAnswerText = typeof userAnswer === 'number' && options[userAnswer] 
      ? options[userAnswer] 
      : userAnswer;
    const correctAnswerText = typeof correctAnswer === 'number' && options[correctAnswer]
      ? options[correctAnswer]
      : correctAnswer;

    const prompt = `${SYSTEM_PROMPTS.explainWrong}

Question: ${question}
Student's Answer: ${userAnswerText}
Correct Answer: ${correctAnswerText}

Explain why the student's answer is wrong and why the correct answer is right:`;

    const response = await generateContent(prompt);
    return {
      success: true,
      explanation: response
    };
  } catch (error) {
    console.error('Gemini Explain Error:', error);
    return {
      success: false,
      explanation: 'Unable to generate explanation right now. Please try again.',
      error: error.message
    };
  }
};

// Generate a new question
export const generateQuestion = async (subject, topic, difficulty = 'medium') => {
  try {
    const prompt = `${SYSTEM_PROMPTS.generateQuestion}

Generate a ${difficulty} difficulty question about:
Subject: ${subject}
Topic: ${topic}

Return ONLY the JSON object:`;
    
    const text = await generateContent(prompt);
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const question = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        question
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini Generate Question Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate multiple questions for a topic
export const generateQuestions = async (subject, topic, count = 5, difficulty = 'medium') => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    const result = await generateQuestion(subject, topic, difficulty);
    if (result.success) {
      questions.push(result.question);
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return {
    success: questions.length > 0,
    questions,
    generated: questions.length,
    requested: count
  };
};

// Get a hint for a question
export const getHint = async (question, options, correctAnswer) => {
  try {
    let prompt = `${SYSTEM_PROMPTS.hint}

Question: ${question}
Options: ${Array.isArray(options) ? options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(', ') : options}

Give a helpful hint without revealing the answer:`;

    const response = await generateContent(prompt);
    return {
      success: true,
      hint: response
    };
  } catch (error) {
    console.error('Gemini Hint Error:', error);
    return {
      success: false,
      hint: 'Think about the key concepts involved in this question.',
      error: error.message
    };
  }
};

// Analyze performance and suggest study path
export const getStudyRecommendations = async (performanceData) => {
  try {
    const prompt = `${SYSTEM_PROMPTS.studyPath}

Student Performance Data:
- Subjects attempted: ${performanceData.subjects?.join(', ') || 'Various'}
- Overall accuracy: ${performanceData.accuracy || 0}%
- Weak topics: ${performanceData.weakTopics?.join(', ') || 'Unknown'}
- Strong topics: ${performanceData.strongTopics?.join(', ') || 'Unknown'}
- Recent mistakes in: ${performanceData.recentMistakes?.join(', ') || 'Unknown'}
- Time spent: ${performanceData.timeSpent || 0} minutes

Provide personalized recommendations as JSON:`;
    
    const text = await generateContent(prompt);
    
    // Try to parse as JSON, fallback to text
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          success: true,
          recommendations: JSON.parse(jsonMatch[0])
        };
      }
    } catch {
      // If not valid JSON, return as text
    }
    
    return {
      success: true,
      recommendations: { text: text }
    };
  } catch (error) {
    console.error('Gemini Study Path Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate battle questions
export const generateBattleQuestions = async (subject, count = 5) => {
  try {
    const prompt = `Generate ${count} competitive quiz questions for a real-time battle about ${subject}.
Questions should be answerable in 15-30 seconds.
Return ONLY a JSON array (no other text):
[
  { "question": "", "options": ["","","",""], "correctAnswer": 0, "timeLimit": 20 },
  ...
]`;
    
    const text = await generateContent(prompt);
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        questions
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini Battle Questions Error:', error);
    
    // Check for quota exceeded error
    const isQuotaError = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RATE_LIMIT');
    
    return {
      success: false,
      error: error.message,
      isQuotaError,
      message: isQuotaError 
        ? 'AI is temporarily rate limited. Please try again in a minute.'
        : 'Failed to generate questions'
    };
  }
};

// Break down a complex concept
export const breakdownConcept = async (concept, subject, level = 'intermediate') => {
  try {
    const prompt = `${SYSTEM_PROMPTS.conceptBreakdown}

Subject: ${subject}
Student Level: ${level}
Concept to break down: ${concept}

Provide a clear breakdown:`;

    const response = await generateContent(prompt);
    return {
      success: true,
      breakdown: response,
      data: { message: response }
    };
  } catch (error) {
    console.error('Gemini Concept Breakdown Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate a daily challenge
export const generateDailyChallenge = async (subjects = ['Mathematics', 'Physics', 'Chemistry']) => {
  try {
    const prompt = `Generate 5 challenging questions for a daily STEM challenge covering: ${subjects.join(', ')}.
Each question should test different concepts and vary in difficulty.
Return ONLY a JSON array (no other text):
[
  { 
    "question": "", 
    "options": ["","","",""], 
    "correctAnswer": 0, 
    "subject": "",
    "topic": "",
    "difficulty": "easy|medium|hard",
    "points": 10
  }
]`;
    
    const text = await generateContent(prompt);
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      // Assign points based on difficulty
      questions.forEach(q => {
        q.points = q.difficulty === 'easy' ? 10 : q.difficulty === 'medium' ? 20 : 30;
      });
      return {
        success: true,
        questions
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini Daily Challenge Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  chatWithTutor,
  explainWrongAnswer,
  generateQuestion,
  generateQuestions,
  getHint,
  getStudyRecommendations,
  generateBattleQuestions,
  breakdownConcept,
  generateDailyChallenge,
  isAIAvailable
};
