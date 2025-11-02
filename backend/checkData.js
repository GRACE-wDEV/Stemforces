import mongoose from "mongoose";
import Question from "./models/question.model.js";
import Quiz from "./models/quiz.model.js";
import dotenv from "dotenv";
import connectDB from "./config/dp.js";

dotenv.config();
connectDB();

async function checkData() {
  try {
    const questionCount = await Question.countDocuments({});
    const publishedQuestions = await Question.countDocuments({ published: true });
    const quizCount = await Quiz.countDocuments({});
    
    console.log("Database status:");
    console.log("- Total questions:", questionCount);
    console.log("- Published questions:", publishedQuestions);
    console.log("- Total quizzes:", quizCount);
    
    if (questionCount > 0) {
      const sampleQuestions = await Question.find({}).limit(3).select("title subject difficulty published");
      console.log("Sample questions:");
      sampleQuestions.forEach(q => {
        console.log(`  - ${q.title} (${q.subject}, ${q.difficulty}, published: ${q.published})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkData();