import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/dp.js';
import User from '../models/user.model.js';

async function run() {
  await connectDB();
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    console.log(`Admin exists: ${admin.email} (${admin._id})`);
  } else {
    console.log('No admin user found');
  }
  process.exit(0);
}

run().catch((err) => { console.error(err); process.exit(1); });
