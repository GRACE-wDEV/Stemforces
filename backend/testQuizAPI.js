import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const testQuizAPI = async () => {
  try {
    console.log('Testing Quiz API...');
    
    // First login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✓ Login successful');
    const token = loginData.token;
    
    // Test create quiz
    const quizData = {
      title: 'Test Math Quiz',
      description: 'A quick test quiz for Math subjects',
      total_time: 30,
      rules: {
        subject: 'Math',
        difficulty: 'easy',
        count: 5,
        randomize: true
      }
    };
    
    const createResponse = await fetch('http://localhost:5000/api/admin/quizzes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(quizData)
    });
    
    const createdQuiz = await createResponse.json();
    console.log('✓ Quiz created successfully:', createdQuiz.title);
    console.log('Quiz ID:', createdQuiz._id);
    
    // Test getting quizzes
    const getQuizzesResponse = await fetch('http://localhost:5000/api/admin/quizzes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const quizzesData = await getQuizzesResponse.json();
    console.log('✓ Quizzes fetched successfully');
    console.log(`Found ${quizzesData.quizzes.length} quizzes`);
    
    // Test home data endpoint
    const homeResponse = await fetch('http://localhost:5000/api/home/data');
    const homeData = await homeResponse.json();
    console.log('✓ Home data fetched successfully');
    console.log(`Found ${homeData.data.subjects.length} subjects`);
    console.log(`Total quizzes across subjects:`, homeData.data.subjects.reduce((acc, s) => acc + (s.totalQuizzes || 0), 0));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testQuizAPI();