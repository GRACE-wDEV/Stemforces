import mongoose from "mongoose";
import User from "../models/user.model.js";
import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";
import UserProgress from "../models/userProgress.model.js";
import Achievement from "../models/achievement.model.js";
import bcrypt from "bcryptjs";

// Sample subjects and sources
const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", 
  "Computer Science", "Engineering", "Medicine", "Environmental Science"
];

const SOURCES = {
  "Mathematics": ["Khan Academy", "MIT OpenCourseWare", "Wolfram MathWorld", "Paul's Online Math Notes"],
  "Physics": ["Khan Academy", "MIT Physics", "Feynman Lectures", "OpenStax Physics"],
  "Chemistry": ["Khan Academy", "MIT Chemistry", "ChemLibreTexts", "Organic Chemistry Tutor"],
  "Biology": ["Khan Academy", "MIT Biology", "Campbell Biology", "Bozeman Science"],
  "Computer Science": ["MIT 6.001", "Stanford CS106", "GeeksforGeeks", "LeetCode"],
  "Engineering": ["MIT Engineering", "Khan Academy", "Engineering Toolbox", "NPTEL"],
  "Medicine": ["Khan Academy", "Osmosis", "Medical School HQ", "NEJM"],
  "Environmental Science": ["Khan Academy", "EPA Resources", "Nature Education", "MIT Environmental"]
};

// Sample questions for each subject
const SAMPLE_QUESTIONS = {
  "Mathematics": [
    {
      text: "What is the derivative of x²?",
      options: ["2x", "x", "2", "x²"],
      correctAnswer: "2x",
      explanation: "The derivative of x² is 2x using the power rule.",
      difficulty: "easy"
    },
    {
      text: "What is the integral of 2x?",
      options: ["x²", "x² + C", "2", "2x"],
      correctAnswer: "x² + C",
      explanation: "The integral of 2x is x² + C, where C is the constant of integration.",
      difficulty: "easy"
    },
    {
      text: "What is the limit of (sin x)/x as x approaches 0?",
      options: ["0", "1", "∞", "undefined"],
      correctAnswer: "1",
      explanation: "This is a famous limit that equals 1.",
      difficulty: "medium"
    }
  ],
  "Physics": [
    {
      text: "What is Newton's second law?",
      options: ["F = ma", "E = mc²", "F = Gm₁m₂/r²", "PV = nRT"],
      correctAnswer: "F = ma",
      explanation: "Newton's second law states that Force equals mass times acceleration.",
      difficulty: "easy"
    },
    {
      text: "What is the speed of light in vacuum?",
      options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁹ m/s"],
      correctAnswer: "3×10⁸ m/s",
      explanation: "The speed of light in vacuum is approximately 3×10⁸ meters per second.",
      difficulty: "easy"
    }
  ],
  "Chemistry": [
    {
      text: "What is the chemical symbol for gold?",
      options: ["Go", "Au", "Ag", "Gd"],
      correctAnswer: "Au",
      explanation: "Au comes from the Latin word 'aurum' meaning gold.",
      difficulty: "easy"
    },
    {
      text: "How many electrons can the first shell hold?",
      options: ["2", "8", "18", "32"],
      correctAnswer: "2",
      explanation: "The first electron shell (K shell) can hold a maximum of 2 electrons.",
      difficulty: "easy"
    }
  ],
  "Biology": [
    {
      text: "What is the powerhouse of the cell?",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
      correctAnswer: "Mitochondria",
      explanation: "Mitochondria produce ATP, the energy currency of the cell.",
      difficulty: "easy"
    },
    {
      text: "What is DNA short for?",
      options: ["Deoxyribonucleic acid", "Dinitric acid", "Dynamic acid", "Dextrose acid"],
      correctAnswer: "Deoxyribonucleic acid",
      explanation: "DNA stands for Deoxyribonucleic acid, which carries genetic information.",
      difficulty: "easy"
    }
  ],
  "Computer Science": [
    {
      text: "What does CPU stand for?",
      options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Core Processing Unit"],
      correctAnswer: "Central Processing Unit",
      explanation: "CPU stands for Central Processing Unit, the main processor of a computer.",
      difficulty: "easy"
    },
    {
      text: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: "O(log n)",
      explanation: "Binary search has O(log n) time complexity as it halves the search space each iteration.",
      difficulty: "medium"
    }
  ]
};

// Generate more questions for each subject
const generateQuestions = (subject) => {
  const baseQuestions = SAMPLE_QUESTIONS[subject] || [];
  const sources = SOURCES[subject] || ["General"];
  const difficulties = ["easy", "medium", "hard"];
  
  const questions = [];
  
  // Add base questions
  baseQuestions.forEach((q, index) => {
    questions.push({
      subject,
      source: sources[index % sources.length],
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      published: true
    });
  });
  
  // Generate additional questions
  for (let i = 0; i < 20; i++) {
    questions.push({
      subject,
      source: sources[i % sources.length],
      text: `Sample ${subject} question ${i + 1}. This is a placeholder question for testing purposes.`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: ["Option A", "Option B", "Option C", "Option D"][i % 4],
      explanation: `This is the explanation for ${subject} question ${i + 1}.`,
      difficulty: difficulties[i % difficulties.length],
      published: true
    });
  }
  
  return questions;
};

// Create sample users
export const createSampleUsers = async () => {
  try {
    console.log("Creating sample users...");
    
    const sampleUsers = [
      {
        username: "admin",
        email: "admin@stemforces.com",
        name: "Admin User",
        password: "admin123",
        role: "admin"
      },
      {
        username: "teacher1",
        email: "teacher1@stemforces.com", 
        name: "Teacher One",
        password: "teacher123",
        role: "editor"
      },
      {
        username: "student1",
        email: "student1@stemforces.com",
        name: "Alice Johnson",
        password: "student123",
        role: "user"
      },
      {
        username: "student2",
        email: "student2@stemforces.com",
        name: "Bob Smith", 
        password: "student123",
        role: "user"
      },
      {
        username: "student3",
        email: "student3@stemforces.com",
        name: "Charlie Brown",
        password: "student123", 
        role: "user"
      }
    ];

    const users = [];
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }]
      });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = await User.create({
          ...userData,
          password: hashedPassword
        });
        users.push(user);
        console.log(`Created user: ${user.username}`);
      }
    }
    
    return users;
  } catch (error) {
    console.error("Error creating sample users:", error);
  }
};

// Create sample questions
export const createSampleQuestions = async () => {
  try {
    console.log("Creating sample questions...");
    
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("No admin user found, skipping question creation");
      return;
    }

    const questions = [];
    
    for (const subject of SUBJECTS) {
      const subjectQuestions = generateQuestions(subject);
      subjectQuestions.forEach(q => {
        q.createdBy = adminUser._id;
      });
      questions.push(...subjectQuestions);
    }

    // Check if questions already exist
    const existingCount = await Question.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} questions already exist, skipping creation`);
      return;
    }

    const createdQuestions = await Question.insertMany(questions);
    console.log(`Created ${createdQuestions.length} sample questions`);
    
    return createdQuestions;
  } catch (error) {
    console.error("Error creating sample questions:", error);
  }
};

// Create sample quizzes
export const createSampleQuizzes = async () => {
  try {
    console.log("Creating sample quizzes...");
    
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("No admin user found, skipping quiz creation");
      return;
    }

    // Check if quizzes already exist
    const existingCount = await Quiz.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} quizzes already exist, skipping creation`);
      return;
    }

    const quizzes = [];
    
    for (const subject of SUBJECTS.slice(0, 4)) { // Create quizzes for first 4 subjects
      // Get questions for this subject
      const questions = await Question.find({ subject }).limit(10);
      
      if (questions.length > 0) {
        const quiz = {
          title: `${subject} Fundamentals Quiz`,
          description: `Test your knowledge of ${subject} fundamentals with this comprehensive quiz.`,
          subject,
          difficulty: "medium",
          total_time: 15, // 15 minutes
          questions: questions.map(q => q._id),
          published: true,
          created_by: adminUser._id,
          rules: {
            subject,
            difficulty: "medium",
            count: questions.length,
            randomize: true
          }
        };
        
        quizzes.push(quiz);
      }
    }

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`Created ${createdQuizzes.length} sample quizzes`);
    
    return createdQuizzes;
  } catch (error) {
    console.error("Error creating sample quizzes:", error);
  }
};

// Create sample user progress
export const createSampleProgress = async () => {
  try {
    console.log("Creating sample user progress...");
    
    const students = await User.find({ role: "user" });
    if (students.length === 0) {
      console.log("No student users found, skipping progress creation");
      return;
    }

    const progressData = [];
    
    for (const student of students) {
      // Check if progress already exists
      const existingProgress = await UserProgress.findOne({ user_id: student._id });
      if (existingProgress) {
        console.log(`Progress already exists for ${student.username}`);
        continue;
      }

      // Generate realistic progress data
      const subjectProgress = [];
      const randomSubjects = SUBJECTS.slice(0, 3 + Math.floor(Math.random() * 3)); // 3-5 subjects per user
      
      for (const subject of randomSubjects) {
        const attempted = 50 + Math.floor(Math.random() * 100);
        const correct = Math.floor(attempted * (0.6 + Math.random() * 0.3)); // 60-90% accuracy
        
        subjectProgress.push({
          subject,
          questions_attempted: attempted,
          questions_correct: correct,
          quizzes_completed: Math.floor(attempted / 10),
          time_spent: Math.floor(attempted * (1 + Math.random() * 2)), // 1-3 minutes per question
          best_score: 70 + Math.floor(Math.random() * 30), // 70-100%
          average_score: Math.round((correct / attempted) * 100)
        });
      }

      const totalAttempted = subjectProgress.reduce((sum, sp) => sum + sp.questions_attempted, 0);
      const totalCorrect = subjectProgress.reduce((sum, sp) => sum + sp.questions_correct, 0);
      const totalQuizzes = subjectProgress.reduce((sum, sp) => sum + sp.quizzes_completed, 0);
      const totalTime = subjectProgress.reduce((sum, sp) => sum + sp.time_spent, 0);
      const totalXP = totalCorrect * 10 + totalQuizzes * 50;

      const progress = {
        user_id: student._id,
        total_questions_attempted: totalAttempted,
        total_questions_correct: totalCorrect,
        total_quizzes_completed: totalQuizzes,
        total_time_spent: totalTime,
        current_streak: Math.floor(Math.random() * 10) + 1,
        total_xp: totalXP,
        level: Math.floor(totalXP / 200) + 1,
        subject_progress: subjectProgress,
        quiz_attempts: [], // Will be populated when users take quizzes
        daily_activity: [],
        last_activity_date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) // Random date in last week
      };

      progressData.push(progress);
    }

    if (progressData.length > 0) {
      const createdProgress = await UserProgress.insertMany(progressData);
      console.log(`Created progress for ${createdProgress.length} users`);
    }

  } catch (error) {
    console.error("Error creating sample progress:", error);
  }
};

// Main seeder function
export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    
    const users = await createSampleUsers();
    const questions = await createSampleQuestions();
    const quizzes = await createSampleQuizzes();
    const progress = await createSampleProgress();
    
    console.log("✅ Database seeding completed!");
    
    return {
      users: users?.length || 0,
      questions: questions?.length || 0,
      quizzes: quizzes?.length || 0,
      progress: progress?.length || 0
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};