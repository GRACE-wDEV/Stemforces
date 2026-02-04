import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

async function addMissing() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const adminUser = await db.collection("users").findOne({ role: "admin" });
    if (!adminUser) throw new Error("No admin user found. Create one first.");

    const question = {
      title: `Grammar Practice Q#140 (added)`,
      question_text: `Which sentence is correct: He ... to work yesterday?`,
      choices: [
        { id: "1", text: "was walking", is_correct: false },
        { id: "2", text: "walks", is_correct: false },
        { id: "3", text: "walked", is_correct: true },
        { id: "4", text: "is walking", is_correct: false }
      ],
      difficulty: "medium",
      time_limit_seconds: 60,
      subject: "English",
      source: "Grammar-Practice",
      tags: ["grammar","practice","fix"],
      explanation: "Past simple: \"walked\" for completed past action.",
      created_by: adminUser._id,
      published: true
    };

    const res = await db.collection("questions").insertOne(question);
    console.log(`Inserted missing question id: ${res.insertedId}`);

    const quiz = await db.collection("quizzes").findOne({ title: "Grammar Practice — Part 7", source: "Grammar-Practice" });
    if (!quiz) throw new Error("Could not find Grammar Practice — Part 7 quiz.");

    await db.collection("quizzes").updateOne({ _id: quiz._id }, { $push: { questions: res.insertedId } });
    await db.collection("categories").updateOne({ subject: "English", name: "General Exercises" }, { $inc: { questionCount: 1 } });
    console.log("Appended missing question to Grammar Practice — Part 7 and updated category count.");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

addMissing();
