// Test MongoDB connection
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log(`Connection string (masked): ${process.env.MONGODB_URI.replace(/\/\/(.+?)@/, '//[USERNAME]:[PASSWORD]@')}`);
  
  const client = new MongoClient(process.env.MONGODB_URI, {
    connectTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 10000,
  });

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database information
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log(`Database name: ${db.databaseName}`);
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Try a simple query
    const loanRecords = await db.collection('LoanRecord').countDocuments();
    console.log(`Number of loan records: ${loanRecords}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(error);
    return false;
  } finally {
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
