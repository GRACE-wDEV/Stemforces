import mongoose from "mongoose";
import User from "./models/user.model.js";
import dotenv from "dotenv";
import connectDB from "./config/dp.js";

dotenv.config();
connectDB();

async function checkUsers() {
  try {
    const users = await User.find({}).select("-password");
    console.log("Current users:", users);
    
    // Create an admin user if none exists
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const adminUser = new User({
        name: "Admin User",
        email: "admin@test.com",
        password: "admin123",
        role: "admin",
        email_verified: true
      });
      await adminUser.save();
      console.log("Created admin user:", adminUser.email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUsers();