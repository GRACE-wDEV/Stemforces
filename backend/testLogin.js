import fetch from 'node-fetch';

const testLogin = async () => {
  try {
    console.log("Testing login...");
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Login failed:", errorData);
      return;
    }
    
    const data = await response.json();
    console.log("Login successful!");
    console.log("User:", data.name, data.email, data.role);
    console.log("Token:", data.token);
    
    // Now test the admin questions endpoint
    console.log("\nTesting admin questions endpoint...");
    
    const questionsResponse = await fetch('http://localhost:5000/api/admin/questions', {
      headers: {
        'Authorization': `Bearer ${data.token}`
      }
    });
    
    if (!questionsResponse.ok) {
      const errorData = await questionsResponse.json();
      console.error("Questions API failed:", errorData);
      return;
    }
    
    const questionsData = await questionsResponse.json();
    console.log("Questions API successful!");
    console.log("Questions found:", questionsData.questions?.length || 0);
    console.log("Pagination:", questionsData.pagination);
    
    if (questionsData.questions && questionsData.questions.length > 0) {
      console.log("Sample question:");
      console.log("- Title:", questionsData.questions[0].title);
      console.log("- Subject:", questionsData.questions[0].subject);
      console.log("- Published:", questionsData.questions[0].published);
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testLogin();