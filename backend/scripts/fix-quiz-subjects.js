import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/dp.js";
import Quiz from "../models/quiz.model.js";

dotenv.config();

const fixQuizSubjects = async () => {
  try {
    await connectDB();
    
    // Update the existing quiz to have a proper subject
    const result = await Quiz.updateOne(
      { title: "Physics Fundamentals Quiz" },
      { $set: { subject: "Physics" } }
    );
    
    console.log(`Updated ${result.modifiedCount} quiz(es) with proper subject`);
    
    // Verify the update
    const quizzes = await Quiz.find({}).select('title subject');
    console.log('\nQuizzes after update:');
    quizzes.forEach(q => console.log(`- ${q.title}: ${q.subject}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixQuizSubjects();