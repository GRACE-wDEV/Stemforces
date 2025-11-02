// Debug script for testing admin functionality
// Put this in browser console to test admin API

const testAdminAPI = async () => {
  const baseURL = 'http://localhost:5000';
  
  // Test question data matching backend schema
  const testQuestion = {
    title: "Test Question",
    question_text: "What is 2 + 2?",
    subject: "Math",
    difficulty: "easy",
    published: false,
    points: 10,
    time_limit_seconds: 60,
    source: "Test Bank",
    explanation: "Basic arithmetic",
    tags: ["arithmetic", "basic"],
    choices: [
      { id: "1", text: "3", is_correct: false },
      { id: "2", text: "4", is_correct: true },
      { id: "3", text: "5", is_correct: false }
    ]
  };

  try {
    // First get auth token
    console.log('Testing question creation...');
    
    // Create question
    const response = await fetch(`${baseURL}/api/admin/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer YOUR_TOKEN_HERE`
      },
      body: JSON.stringify(testQuestion)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Question created successfully:', result);
    } else {
      const error = await response.text();
      console.error('Error creating question:', error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// testAdminAPI();