import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/dp.js";
import Quiz from "../models/quiz.model.js";

dotenv.config();

const checkQuizzes = async () => {
  try {
    await connectDB();
    const quizzes = await Quiz.find({}).select('title subject');
    
    console.log('Quizzes in database:');
    quizzes.forEach(q => console.log(`- ${q.title}: ${q.subject || 'NO SUBJECT'}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkQuizzes();