import api from "./axios";

// AI Service Configuration
const AI_CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
  TIMEOUT: 15000,
  FALLBACK_ENABLED: true
};

// Retry helper with exponential backoff
const retryWithBackoff = async (fn, retries = AI_CONFIG.MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      await new Promise(resolve => 
        setTimeout(resolve, AI_CONFIG.RETRY_DELAY * (AI_CONFIG.MAX_RETRIES - retries + 1))
      );
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};

// Error handler with user-friendly messages
const handleAIError = (error, fallbackMessage) => {
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;
  
  let userMessage = fallbackMessage;
  
  if (status === 429) {
    userMessage = "AI service is currently at capacity. Please try again in a few moments.";
  } else if (status === 503) {
    userMessage = "AI service is temporarily unavailable. Using fallback content.";
  } else if (status >= 500) {
    userMessage = "AI service encountered an error. Please try again.";
  } else if (!navigator.onLine) {
    userMessage = "No internet connection. Please check your network.";
  }
  
  console.warn('AI Error:', { status, message, fallbackMessage });
  
  return {
    success: false,
    error: true,
    message: userMessage,
    data: null
  };
};

// AI Tutor Chat
export const chatWithTutor = async (message, context = {}) => {
  try {
    const response = await retryWithBackoff(async () => 
      await api.post("/ai/chat", { message, context }, { timeout: AI_CONFIG.TIMEOUT })
    );
    return response.data;
  } catch (error) {
    return handleAIError(error, "Unable to chat with AI tutor. Please try again later.");
  }
};

// Explain why an answer was wrong
export const explainWrongAnswer = async (question, userAnswer, correctAnswer, subject) => {
  try {
    const response = await retryWithBackoff(async () =>
      await api.post("/ai/explain", {
        question,
        userAnswer,
        correctAnswer,
        subject,
      }, { timeout: AI_CONFIG.TIMEOUT })
    );
    return response.data;
  } catch (error) {
    if (AI_CONFIG.FALLBACK_ENABLED) {
      // Provide basic fallback explanation
      return {
        success: true,
        data: {
          explanation: `The correct answer is: ${correctAnswer}.\n\nWhile we can't provide a detailed AI explanation right now, review the question carefully and compare your answer with the correct one. Consider the key concepts and try to identify where your reasoning differed.`
        }
      };
    }
    return handleAIError(error, "Unable to generate explanation. Please try again.");
  }
};

// Get a hint for a question
export const getHint = async (question, options, subject, hintLevel = 1) => {
  try {
    const response = await retryWithBackoff(async () =>
      await api.post("/ai/hint", {
        question,
        options,
        subject,
        hintLevel,
      }, { timeout: AI_CONFIG.TIMEOUT })
    );
    return response.data;
  } catch (error) {
    if (AI_CONFIG.FALLBACK_ENABLED && hintLevel === 1) {
      // Provide generic fallback hint
      const hints = [
        "Read the question carefully and identify the key information.",
        "Consider the fundamentals of the topic before choosing.",
        "Eliminate obviously incorrect answers first.",
        "Think about what you've learned about this subject."
      ];
      return {
        success: true,
        data: {
          hint: hints[Math.floor(Math.random() * hints.length)]
        }
      };
    }
    return handleAIError(error, "Unable to generate hint. Please try again.");
  }
};

// Generate practice questions
export const generateQuestions = async (subject, topic, difficulty, count = 5) => {
  try {
    const response = await retryWithBackoff(async () =>
      await api.post("/ai/generate-questions", {
        subject,
        topic,
        difficulty,
        count,
      }, { timeout: AI_CONFIG.TIMEOUT * 2 })
    );
    return response.data;
  } catch (error) {
    return handleAIError(error, "Unable to generate questions. Please try selecting from existing questions.");
  }
};

// Get personalized study recommendations
export const getStudyRecommendations = async (performanceData) => {
  try {
    const response = await retryWithBackoff(async () =>
      await api.post("/ai/study-recommendations", {
        performanceData,
      }, { timeout: AI_CONFIG.TIMEOUT })
    );
    return response.data;
  } catch (error) {
    if (AI_CONFIG.FALLBACK_ENABLED) {
      return {
        success: true,
        data: {
          recommendations: "Focus on practicing topics where you scored below 70%. Review the explanations for questions you missed, and try similar problems to reinforce your understanding."
        }
      };
    }
    return handleAIError(error, "Unable to generate recommendations.");
  }
};

// Generate battle questions (unique, AI-created)
export const generateBattleQuestions = async (subject, difficulty, count = 5) => {
  try {
    const response = await retryWithBackoff(async () =>
      await api.post("/ai/battle-questions", {
        subject,
        difficulty,
        count,
      }, { timeout: AI_CONFIG.TIMEOUT * 2 })
    );
    return response.data;
  } catch (error) {
    return handleAIError(error, "Unable to generate battle questions. Using sample questions.");
  }
};

// Concept breakdown - explain a concept in simple terms
export const breakdownConcept = async (concept, subject, studentLevel = "intermediate") => {
  try {
    const response = await retryWithBackoff(async () =>
      await api.post("/ai/breakdown", {
        concept,
        subject,
        studentLevel,
      }, { timeout: AI_CONFIG.TIMEOUT })
    );
    return response.data;
  } catch (error) {
    if (AI_CONFIG.FALLBACK_ENABLED) {
      return {
        success: true,
        data: {
          breakdown: `**${concept}** is an important concept in ${subject}. While we can't provide a detailed AI explanation right now, we recommend reviewing your textbook or class notes for this topic. Try searching for "${concept} ${subject}" online for additional resources.`
        }
      };
    }
    return handleAIError(error, "Unable to generate concept breakdown.");
  }
};

// Generate daily challenge
export const generateDailyChallenge = async (subjects) => {
  try {
    const response = await retryWithBackoff(async () =>
      await api.post("/ai/daily-challenge", {
        subjects,
      }, { timeout: AI_CONFIG.TIMEOUT * 2 })
    );
    return response.data;
  } catch (error) {
    return handleAIError(error, "Unable to generate daily challenge. Please try again later.");
  }
};
