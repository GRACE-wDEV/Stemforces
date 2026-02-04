import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const Quiz = mongoose.model('Quiz', new mongoose.Schema({}, { strict: false }));
  const Question = mongoose.model('Question', new mongoose.Schema({}, { strict: false }));

  const quizzes = await Quiz.find({ title: /Upstream MCQs - Part/i }).lean();
  console.log('Found quizzes:', quizzes.length);
  for (const q of quizzes) {
    const questionIds = Array.isArray(q.questions) ? q.questions : [];
    const count = await Question.countDocuments({ _id: { $in: questionIds }, deleted_at: null, published: true });
    console.log('Quiz:', q.title, 'ID:', q._id.toString(), 'questions total (referenced):', questionIds.length, 'published (count):', count);
    if (questionIds.length > 0) {
      const sample = await Question.findOne({ _id: questionIds[0] }).lean();
      console.log(' Sample question doc (raw):', sample ? { _id: sample._id, question_text: sample.question_text, published: sample.published, deleted_at: sample.deleted_at } : 'NOT FOUND');
    }
    // Remove stale quizzes that reference zero published questions
    if (count === 0) {
      console.log('  -> Deleting stale quiz:', q._id.toString());
      await Quiz.deleteOne({ _id: q._id });
    }
  }

  // Also check any quiz with source Upstream
  const bySource = await Quiz.find({ source: 'Upstream' }).lean();
  console.log('Quizzes with source Upstream:', bySource.length);

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
