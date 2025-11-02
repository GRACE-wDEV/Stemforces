import Question from "./models/question.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const getSubjectsAndSources = async () => {
  await connectDB();
  
  try {
    const questions = await Question.find({ deleted_at: null })
      .select('subject source title difficulty');
      
    console.log("Total questions found:", questions.length);
    
    // Get unique subjects
    const subjects = [...new Set(questions.map(q => q.subject))];
    console.log("\nAvailable subjects:", subjects);
    
    // Get unique sources/topics
    const sources = [...new Set(questions.map(q => q.source))];
    console.log("\nAvailable sources/topics:", sources);
    
    // Group questions by subject
    const questionsBySubject = {};
    questions.forEach(q => {
      if (!questionsBySubject[q.subject]) {
        questionsBySubject[q.subject] = [];
      }
      questionsBySubject[q.subject].push(q);
    });
    
    console.log("\nQuestions by subject:");
    Object.entries(questionsBySubject).forEach(([subject, qs]) => {
      console.log(`${subject}: ${qs.length} questions`);
      const topicCounts = {};
      qs.forEach(q => {
        topicCounts[q.source] = (topicCounts[q.source] || 0) + 1;
      });
      console.log("  Topics:", Object.entries(topicCounts).map(([topic, count]) => `${topic} (${count})`).join(', '));
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

getSubjectsAndSources();