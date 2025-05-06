// Simple MongoDB connection test without dependencies
// Load environment variables from .env file
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    acc[key] = value;
  }
  return acc;
}, {});

// Get MongoDB URI
const mongoUri = envVars.MONGODB_URI;
console.log('MongoDB URI (masked):', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//[USERNAME]:[PASSWORD]@'));

// Use native Node.js https module to test connectivity to MongoDB Atlas
const https = require('https');

// Extract hostname from MongoDB URI
const hostname = mongoUri.match(/@([^\/]+)\//)[1];
console.log('Testing connectivity to MongoDB Atlas hostname:', hostname);

// Test HTTPS connectivity
const req = https.request({
  hostname,
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000,
}, (res) => {
  console.log('MongoDB Atlas connectivity status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', () => {});
  res.on('end', () => {
    console.log('Connection test completed');
  });
});

req.on('error', (e) => {
  console.error('Connection error:', e.message);
});

req.on('timeout', () => {
  console.error('Connection timeout');
  req.destroy();
});

req.end();
