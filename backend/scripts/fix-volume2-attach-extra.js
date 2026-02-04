import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

async function attachExtra() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Question = mongoose.model("Question", new mongoose.Schema({}, { strict: false }));
    const Quiz = mongoose.model("Quiz", new mongoose.Schema({}, { strict: false }));

    const extra = await Question.findOne({ title: "General Vol2 Q#109" });
    if (!extra) {
      console.log("No extra question Q#109 found — aborting.");
      return;
    }

    const quiz = await Quiz.findOne({ title: "Volume 2, Part 6", source: "General-Volume2" });
    if (!quiz) {
      console.log("Volume 2, Part 6 not found — aborting.");
      return;
    }

    // If already present, do nothing
    if (quiz.questions && quiz.questions.find(q => String(q) === String(extra._id))) {
      console.log("Extra question already in Part 6.");
    } else {
      quiz.questions.push(extra._id);
      quiz.total_time = (quiz.questions.length) * (quiz.per_question_time || 60);
      await quiz.save();
      console.log(`✅ Attached Q#109 (${extra._id}) to ${quiz.title}. Now has ${quiz.questions.length} questions.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

attachExtra();
