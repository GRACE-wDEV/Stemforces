import fetch from 'node-fetch';

const testHomeAPI = async () => {
  try {
    console.log('Testing Home API endpoint...');
    
    const response = await fetch('http://localhost:5000/api/home/data');
    const data = await response.json();
    
    console.log('Success:', data.success);
    console.log('Subjects found:', data.data.subjects.length);
    console.log('Total questions:', data.data.totalQuestions);
    
    if (data.data.subjects.length > 0) {
      console.log('\nSample subject:');
      console.log('Name:', data.data.subjects[0].name);
      console.log('Topics:', data.data.subjects[0].topics.length);
      console.log('Questions:', data.data.subjects[0].totalQuestions);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testHomeAPI();