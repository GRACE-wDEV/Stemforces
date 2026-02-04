
import { OpenAI } from 'openai';

// Initialize OpenAI only if API key is present
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Check if AI is available
const isAIAvailable = () => !!openai;

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

  battleQuestion: `Generate a competitive quiz question suitable for a real-time battle between students.
The question should be:
- Challenging but fair
- Answerable in under 30 seconds
- Clear and unambiguous
Return ONLY valid JSON: { "question": "", "options": [], "correctAnswer": 0, "timeLimit": 20 }`,

  conceptBreakdown: `Break down a complex STEM concept into simple, digestible parts.
- Use analogies students can relate to
- Build from simple to complex
- Include examples
- Use LaTeX for math ($)
- Make it engaging and memorable`
};

// AI Tutor - Chat with students
export const chatWithTutor = async (message, context = {}) => {
  if (!isAIAvailable()) {
    return {
      success: false,
      message: 'AI tutor is not configured. Please set OPENAI_API_KEY environment variable.'
    };
  }
  
  try {
    const systemPrompt = SYSTEM_PROMPTS.tutor;
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 512,
      temperature: 0.7
    });
    return {
      success: true,
      message: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('OpenAI Tutor Error:', error);
    return {
      success: false,
      message: 'AI is temporarily unavailable. Please try again later.',
      error: error.message
    };
  }
};

// Explain why an answer was wrong
export const explainWrongAnswer = async (question, userAnswer, correctAnswer, options) => {
  if (!isAIAvailable()) {
    return {
      success: false,
      explanation: 'AI explanations are not configured. Please set OPENAI_API_KEY environment variable.'
    };
  }
  
  try {
    const systemPrompt = SYSTEM_PROMPTS.explainWrong;
    const userPrompt = `Question: ${question}\nStudent's Answer: ${options[userAnswer]} (Option ${String.fromCharCode(65 + userAnswer)})\nCorrect Answer: ${options[correctAnswer]} (Option ${String.fromCharCode(65 + correctAnswer)})\n\nPlease explain:`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300,
      temperature: 0.6
    });

    const explanationText = completion.choices?.[0]?.message?.content || "Unable to generate explanation right now.";
    return {
      success: true,
      explanation: explanationText
    };
  } catch (error) {
    console.error('AI Explain Error:', error);
    return {
      success: false,
      explanation: 'Unable to generate explanation right now.',
      error: error.message
    };
  }
};

// Generate a new question
export const generateQuestion = async (subject, topic, difficulty = 'medium') => {
  try {
    const model = getModel();
    
    const prompt = `${SYSTEM_PROMPTS.generateQuestion}

Generate a ${difficulty} difficulty question about:
Subject: ${subject}
Topic: ${topic}

JSON:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
    console.error('AI Generate Question Error:', error);
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
    const systemPrompt = SYSTEM_PROMPTS.hint;
    let userPrompt = `Question: ${question}\nOptions: ${options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(', ')}`;
    if (typeof correctAnswer !== 'undefined' && correctAnswer !== null && correctAnswer !== '') {
      userPrompt += `\n(Correct answer index: ${correctAnswer})`;
    }
    userPrompt += '\n\nGive a helpful hint:';
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 128,
      temperature: 0.7
    });
    return {
      success: true,
      hint: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('OpenAI Hint Error:', error);
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
    const model = getModel();
    
    const prompt = `${SYSTEM_PROMPTS.studyPath}

Student Performance Data:
- Subjects attempted: ${performanceData.subjects?.join(', ') || 'Various'}
- Overall accuracy: ${performanceData.accuracy || 0}%
- Weak topics: ${performanceData.weakTopics?.join(', ') || 'Unknown'}
- Strong topics: ${performanceData.strongTopics?.join(', ') || 'Unknown'}
- Recent mistakes in: ${performanceData.recentMistakes?.join(', ') || 'Unknown'}
- Time spent: ${performanceData.timeSpent || 0} minutes

Provide personalized recommendations:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
    console.error('AI Study Path Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate battle questions
export const generateBattleQuestions = async (subject, count = 5) => {
  try {
    const model = getModel();
    
    const prompt = `Generate ${count} competitive quiz questions for a real-time battle about ${subject}.
Questions should be answerable in 15-30 seconds.
Return ONLY a JSON array:
[
  { "question": "", "options": ["","","",""], "correctAnswer": 0, "timeLimit": 20 },
  ...
]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
    console.error('AI Battle Questions Error:', error);
    
    // Check for quota exceeded error
    const isQuotaError = error.message?.includes('429') || error.message?.includes('quota');
    
    return {
      success: false,
      error: error.message,
      isQuotaError,
      message: isQuotaError 
        ? 'AI is temporarily unavailable. Using sample questions instead.'
        : 'Failed to generate questions'
    };
  }
};

// Break down a complex concept
export const breakdownConcept = async (concept, subject) => {
  try {
    const systemPrompt = SYSTEM_PROMPTS.conceptBreakdown;
    const userPrompt = `Subject: ${subject}\nConcept to break down: ${concept}`;
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 256,
      temperature: 0.7
    });
    return {
      success: true,
      breakdown: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('OpenAI Concept Breakdown Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate a daily challenge
export const generateDailyChallenge = async (subjects = ['Mathematics', 'Physics', 'Chemistry']) => {
  try {
    const model = getModel();
    
    const prompt = `Generate 5 challenging questions for a daily STEM challenge covering: ${subjects.join(', ')}.
Each question should test different concepts and vary in difficulty.
Return ONLY a JSON array:
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
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
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
    console.error('AI Daily Challenge Error:', error);
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
  generateDailyChallenge
};
