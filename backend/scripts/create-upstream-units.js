import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

async function createUpstreamUnits() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Minimal models (avoid importing from codebase)
    const Question = mongoose.model(
      "Question",
      new mongoose.Schema({}, { strict: false, timestamps: true })
    );

    const Quiz = mongoose.model(
      "Quiz",
      new mongoose.Schema({}, { strict: false, timestamps: true })
    );

    const Category = mongoose.model(
      "Category",
      new mongoose.Schema({}, { strict: false })
    );

    // Find Upstream category for English
    const upstreamCategory = await Category.findOne({ subject: "English", name: "Upstream" });
    if (!upstreamCategory) {
      console.error("❌ Could not find an 'Upstream' category for subject English. Please create it first.");
      return process.exit(1);
    }

    // Load published Upstream questions
    const upstreamQuestions = await Question.find({ source: "Upstream", subject: "English", published: true }).sort({ createdAt: 1 }).lean();
    console.log(`ℹ️  Found ${upstreamQuestions.length} published Upstream questions in DB`);

    const needed = 3 * 47; // 141 questions
    if (upstreamQuestions.length < needed) {
      console.error(`❌ Not enough Upstream questions. Need ${needed}, found ${upstreamQuestions.length}.`);
      console.error("You can either seed the missing questions or provide a questions JSON file. Aborting.");
      return process.exit(1);
    }

    // Remove any existing unit quizzes we will recreate
    const del = await Quiz.deleteMany({ source: "Upstream-Unit1" }).catch(() => ({}));
    if (del && del.deletedCount !== undefined) console.log(`🗑️  Deleted ${del.deletedCount} existing Upstream-Unit1 quizzes`);

    // Create 3 quizzes of 47 questions each
    const created = [];
    for (let part = 0; part < 3; part++) {
      const start = part * 47;
      const slice = upstreamQuestions.slice(start, start + 47).map((q) => q._id);
      const title = `Upstream Unit 1 - Part ${part + 1}`;
      const description = `Upstream Unit 1 — Part ${part + 1} (47 questions)`;

      const quizDoc = await Quiz.create({
        title,
        description,
        subject: "English",
        category: upstreamCategory._id,
        questions: slice,
        total_time: slice.length * 60,
        per_question_time: 60,
        randomized: true,
        show_results: true,
        allow_review: true,
        passing_score: 60,
        published: true,
        attempts: 0,
        avg_score: 0,
        source: "Upstream-Unit1",
        created_by: null
      });

      created.push(quizDoc);
      console.log(`✅ Created quiz: "${title}" with ${slice.length} questions`);
    }

    // Update category counts (increment quizCount by 3, questionCount remains as-is)
    await Category.updateOne({ _id: upstreamCategory._id }, { $inc: { quizCount: created.length } });

    console.log(`\n🎉 Created ${created.length} Upstream Unit quizzes.`);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

createUpstreamUnits();
