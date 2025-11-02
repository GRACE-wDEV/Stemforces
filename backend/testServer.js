import fetch from 'node-fetch';

const testEndpoints = async () => {
  try {
    console.log('Testing server endpoints...');
    
    // Test basic health check
    const healthResponse = await fetch('http://localhost:5000/api/health');
    if (healthResponse.ok) {
      console.log('✓ Health endpoint working');
    } else {
      console.log('✗ Health endpoint failed');
    }
    
    // Test home data endpoint
    const homeResponse = await fetch('http://localhost:5000/api/home/data');
    if (homeResponse.ok) {
      const data = await homeResponse.json();
      console.log('✓ Home data endpoint working');
      console.log(`Found ${data.data?.subjects?.length || 0} subjects`);
      console.log(`Total questions: ${data.data?.totalQuestions || 0}`);
    } else {
      console.log('✗ Home data endpoint failed:', homeResponse.status);
      const error = await homeResponse.text();
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testEndpoints();