// Simple script to test the dashboard stats API response
const fetch = require('node-fetch');

async function testApi() {
  try {
    console.log('Testing dashboard stats API...');
    const response = await fetch('http://localhost:3000/api/dashboard/stats');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();
