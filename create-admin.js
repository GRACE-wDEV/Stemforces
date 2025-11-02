// Test script to create an admin user
// Run this in MongoDB shell or through your backend API

db.users.insertOne({
  name: "Admin User",
  email: "admin@stemforces.com",
  password: "$2b$10$rO9Wj8qGqUjLhHu8KhLdDe4xCZQl5fY3FEwZeF3GZCdHBhXsVgFhi", // password: "admin123"
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
});

console.log("Admin user created successfully!");
console.log("Login with:");
console.log("Email: admin@stemforces.com");
console.log("Password: admin123");