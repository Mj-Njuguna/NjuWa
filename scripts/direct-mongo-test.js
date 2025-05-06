// Direct MongoDB connection test using the MongoDB native driver
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testMongoConnection() {
  console.log('Testing direct MongoDB connection...');
  
  // Get the connection string from environment variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    return;
  }
  
  // Mask the connection string for security
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//[USERNAME]:[PASSWORD]@');
  console.log('Connection string (masked):', maskedUri);
  
  // Create a new MongoClient
  const client = new MongoClient(uri, {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 60000,
    ssl: true,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });
  
  try {
    // Connect to the MongoDB server
    console.log('Attempting to connect...');
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // Get the list of databases
    const adminDb = client.db('admin');
    const result = await adminDb.command({ ping: 1 });
    console.log('Ping result:', result);
    
    const dbs = await client.db().admin().listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

// Run the test
testMongoConnection()
  .then(success => {
    console.log('Test completed. Connection successful:', success);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
