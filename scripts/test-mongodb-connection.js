// Simple script to test MongoDB connection directly
// Run with: node scripts/test-mongodb-connection.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('Connection string (masked):', 
    process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//[USERNAME]:[PASSWORD]@'));
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // Try a simple command
    const result = await client.db('admin').command({ ping: 1 });
    console.log('MongoDB ping result:', result);
    
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

testConnection()
  .then(success => {
    console.log('Test completed. Connection successful:', success);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
