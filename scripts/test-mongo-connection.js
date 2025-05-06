// Test script to check MongoDB connection directly using the MongoDB driver
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }
  
  console.log('Testing MongoDB connection...');
  console.log(`Connection string: ${uri.replace(/:[^:]*@/, ':****@')}`); // Hide password in logs
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    
    // List all databases
    const dbs = await client.db().admin().listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(` - ${db.name}`);
    });
    
    // Get the default database from the connection string
    const dbName = new URL(uri).pathname.substring(1) || 'Cluster0';
    const db = client.db(dbName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\nCollections in database '${dbName}':`);
    if (collections.length === 0) {
      console.log(' - No collections found');
    } else {
      collections.forEach(collection => {
        console.log(` - ${collection.name}`);
      });
    }
    
    console.log('\nDatabase connection test completed successfully.');
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
