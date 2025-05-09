// Simple MongoDB connection test
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  // Get connection string from environment variables
  const uri = process.env.MONGODB_URI;
  
  // Log masked connection string for security
  console.log(`Connection string (masked): ${uri.replace(/\/\/(.+?)@/, '//[USERNAME]:[PASSWORD]@')}`);
  
  // Create MongoDB client with extended timeout options
  const client = new MongoClient(uri, {
    connectTimeoutMS: 15000, // 15 seconds
    socketTimeoutMS: 15000,
    serverSelectionTimeoutMS: 15000,
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Connect to the MongoDB server
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database information
    const db = client.db();
    console.log(`Connected to database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ') || 'No collections found'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(error);
    return false;
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('Database connection test completed successfully!');
    } else {
      console.log('Database connection test failed.');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
