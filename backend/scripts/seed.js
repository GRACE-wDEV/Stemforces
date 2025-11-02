import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/dp.js";
import { seedDatabase } from "../utils/seeder.js";

dotenv.config();

const runSeeder = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();
    
    console.log("Running seeder...");
    const results = await seedDatabase();
    
    console.log("\n📊 Seeding Results:");
    console.log(`Users: ${results.users}`);
    console.log(`Questions: ${results.questions}`);
    console.log(`Quizzes: ${results.quizzes}`);
    console.log(`Progress: ${results.progress}`);
    
    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

runSeeder();