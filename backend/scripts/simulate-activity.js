import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/dp.js";
import { updateUserProgress } from "../utils/progressTracker.js";
import User from "../models/user.model.js";
import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";

dotenv.config();

const simulateQuizActivity = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    
    console.log("🎮 Simulating user quiz activity...");
    
    // Get student users
    const students = await User.find({ role: "user" });
    if (students.length === 0) {
      console.log("No student users found");
      return;
    }
    
    // Get available quizzes
    const quizzes = await Quiz.find({ published: true }).populate('questions');
    if (quizzes.length === 0) {
      console.log("No quizzes found");
      return;
    }
    
    console.log(`Found ${students.length} students and ${quizzes.length} quizzes`);
    
    // Simulate quiz attempts for each student
    for (const student of students) {
      console.log(`\n👤 Simulating activity for ${student.username || student.name}...`);
      
      // Each student takes 1-2 quizzes
      const numQuizzes = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < numQuizzes; i++) {
        const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
        console.log(`📚 Selected quiz: "${randomQuiz.title}" in ${randomQuiz.subject}`);
        
        const questionsTotal = randomQuiz.questions.length || 5; // Default to 5 if no questions
        
        if (questionsTotal === 0) {
          console.log(`  ⚠️ Skipping quiz with no questions`);
          continue;
        }
        
        // Generate realistic performance
        const accuracy = 0.5 + Math.random() * 0.4; // 50-90% accuracy
        const questionsCorrect = Math.floor(questionsTotal * accuracy);
        const timeTaken = Math.floor(5 + Math.random() * 20); // 5-25 minutes
        
        console.log(`  📝 Taking "${randomQuiz.title}": ${questionsCorrect}/${questionsTotal} correct in ${timeTaken}min`);
        
        try {
          // Update user progress with proper subject from quiz
          const progressUpdate = await updateUserProgress(student._id, {
            subject: randomQuiz.subject || "Mathematics", // Fallback subject
            questionsCorrect,
            questionsTotal,
            timeTaken,
            quizId: randomQuiz._id,
            isFirstQuiz: i === 0
          });
          
          console.log(`  ✨ Gained ${progressUpdate.xpEarned} XP! Level ${progressUpdate.newLevel}, Streak: ${progressUpdate.currentStreak}`);
        } catch (error) {
          console.log(`  ❌ Error updating progress: ${error.message}`);
        }
      }
    }
    
    console.log("\n🎉 Quiz activity simulation completed!");
    console.log("Check the homepage and leaderboard to see the real data!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error simulating quiz activity:", error);
    process.exit(1);
  }
};

simulateQuizActivity();