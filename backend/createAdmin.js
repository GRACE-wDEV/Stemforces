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

const createAdminUser = async () => {
  await connectDB();
  
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@test.com" });
    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log("Email:", existingAdmin.email);
      console.log("Name:", existingAdmin.name);
      console.log("Role:", existingAdmin.role);
      console.log("Active:", existingAdmin.active);
      return;
    }
    
    // Create new admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "admin123", // This will be hashed by the pre-save middleware
      role: "admin",
      active: true
    });
    
    console.log("Admin user created successfully:");
    console.log("Email:", adminUser.email);
    console.log("Name:", adminUser.name);
    console.log("Role:", adminUser.role);
    console.log("ID:", adminUser._id);
    
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();