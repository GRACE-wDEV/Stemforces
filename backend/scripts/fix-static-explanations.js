/**
 * fix-static-explanations.js
 * 
 * Removes the generic "Why the other options don't work" sections that contain
 * the useless fallback text "While X is a valid English word, it doesn't carry
 * the right meaning or doesn't collocate naturally..."
 * 
 * Keeps only the core correct-answer explanation. The AI button handles
 * in-depth explanations now.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.model("Question", questionSchema);

// Pattern that identifies the bad generic fallback
const GENERIC_PATTERN = /it doesn't carry the right meaning or doesn't collocate naturally/;
const GENERIC_PATTERN2 = /This doesn't fit the meaning or collocation needed in this sentence/;

function cleanExplanation(explanation) {
  if (!explanation) return explanation;

  // If it has the ✅ + "Why the other options" structure, extract just the core
  const whyIdx = explanation.indexOf("**Why the other options don't work:**");
  if (whyIdx === -1) {
    // Also check without bold markdown
    const whyIdx2 = explanation.indexOf("Why the other options don't work:");
    if (whyIdx2 === -1) return explanation; // No template structure, leave as-is
    // Has the section but without bold — strip it
    return explanation.substring(0, whyIdx2).trim();
  }

  // Extract the part before "Why the other options"
  let core = explanation.substring(0, whyIdx).trim();

  // If it starts with ✅ **"word"** is correct — , extract just the explanation after
  const correctMatch = core.match(/^✅\s*\*\*"[^"]+"\*\*\s*is correct\s*[—–-]\s*/);
  if (correctMatch) {
    core = core.substring(correctMatch[0].length).trim();
  }

  // If what remains is empty or trivially short, return a minimal version
  if (!core || core.length < 5) {
    // Try to get the correct answer word from the ✅ line
    const wordMatch = explanation.match(/✅\s*\*\*"([^"]+)"\*\*/);
    if (wordMatch) {
      return `The correct answer is "${wordMatch[1]}".`;
    }
    return "";
  }

  return core;
}

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected.\n");

  // Find questions with the generic fallback pattern
  const badQuestions = await Question.find({
    $or: [
      { explanation: { $regex: "it doesn't carry the right meaning or doesn't collocate naturally" } },
      { explanation: { $regex: "This doesn't fit the meaning or collocation needed in this sentence" } },
      { explanation: { $regex: "Why the other options don't work" } }
    ]
  }).lean();

  console.log(`Found ${badQuestions.length} questions with generic/template explanations.\n`);

  if (badQuestions.length === 0) {
    console.log("Nothing to fix!");
    await mongoose.disconnect();
    return;
  }

  // Show a few examples before/after
  console.log("=== SAMPLE BEFORE/AFTER (first 3) ===\n");
  for (const q of badQuestions.slice(0, 3)) {
    const cleaned = cleanExplanation(q.explanation);
    console.log(`Q: ${(q.title || q.question || "").substring(0, 80)}...`);
    console.log(`BEFORE (${q.explanation?.length} chars): ${q.explanation?.substring(0, 120)}...`);
    console.log(`AFTER  (${cleaned?.length} chars): ${cleaned?.substring(0, 120)}`);
    console.log("---");
  }

  // Bulk update
  let updated = 0;
  let errors = 0;

  for (const q of badQuestions) {
    const cleaned = cleanExplanation(q.explanation);
    try {
      await Question.updateOne(
        { _id: q._id },
        { $set: { explanation: cleaned } }
      );
      updated++;
    } catch (err) {
      errors++;
      console.error(`Error updating ${q._id}:`, err.message);
    }
  }

  console.log(`\n✅ Updated ${updated} questions.`);
  if (errors > 0) console.log(`❌ ${errors} errors.`);

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
