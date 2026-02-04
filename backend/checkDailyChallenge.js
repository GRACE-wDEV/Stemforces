import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const DailyChallenge = mongoose.model('DailyChallenge', new mongoose.Schema({ 
    date: Date, 
    title: String, 
    questions: [mongoose.Schema.Types.ObjectId],
    active: Boolean 
  }, { collection: 'dailychallenges' }));
  
  const challenges = await DailyChallenge.find({}).sort({ date: -1 });
  console.log('\n=== ALL DAILY CHALLENGES ===');
  console.log('Total:', challenges.length);
  challenges.forEach(c => {
    console.log(`  ${c.date?.toISOString()} | ${c.title} | Questions: ${c.questions?.length} | Active: ${c.active}`);
  });
  
  // Check today's date comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  console.log('\n=== TODAY DATE RANGE ===');
  console.log('Today (start):', today.toISOString());
  console.log('Tomorrow (end):', tomorrow.toISOString());
  
  const todayChallenge = await DailyChallenge.findOne({
    date: { $gte: today, $lt: tomorrow },
    active: true
  });
  
  console.log('\n=== TODAY CHALLENGE ===');
  if (todayChallenge) {
    console.log('Found:', todayChallenge.title, '| Date:', todayChallenge.date?.toISOString());
  } else {
    console.log('No challenge found for today!');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
