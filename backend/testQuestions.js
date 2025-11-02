import Question from "./models/question.model.js";
import User from "./models/user.model.js";
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

const testQuestions = async () => {
  await connectDB();
  
  try {
    const questions = await Question.find({ deleted_at: null })
      .populate('created_by', 'name email')
      .limit(5);
      
    console.log("Questions found:", questions.length);
    console.log("Sample question structure:");
    if (questions.length > 0) {
      console.log(JSON.stringify(questions[0], null, 2));
    }
    
    // Test the admin query structure
    const page = 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const [adminQuestions, total] = await Promise.all([
      Question.find({ deleted_at: null })
        .populate('created_by', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Question.countDocuments({ deleted_at: null })
    ]);
    
    console.log("\nAdmin API simulation:");
    console.log("Total questions:", total);
    console.log("Questions returned:", adminQuestions.length);
    
    const response = {
      questions: adminQuestions,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit),
      }
    };
    
    console.log("\nResponse structure:");
    console.log("questions array length:", response.questions.length);
    console.log("pagination:", response.pagination);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testQuestions();