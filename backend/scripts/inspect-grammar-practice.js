import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

async function inspectGrammar() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const quizzes = await db.collection("quizzes").find({ source: "Grammar-Practice" }).toArray();
    console.log(`Found ${quizzes.length} quizzes with source Grammar-Practice`);
    for (const q of quizzes) {
      const count = Array.isArray(q.questions) ? q.questions.length : (q.questions_count || 0);
      console.log(`Quiz: ${q.title} — ${count} questions — id: ${q._id}`);
    }
    const totalQuestions = await db.collection("questions").countDocuments({ source: "Grammar-Practice" });
    console.log(`Total Question docs with source Grammar-Practice: ${totalQuestions}`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectGrammar();
