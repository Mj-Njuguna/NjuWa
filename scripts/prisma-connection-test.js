// Test MongoDB connection using Prisma
const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  console.log('Testing MongoDB connection via Prisma...');
  
  // Create a new PrismaClient with detailed logging
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    // Try a simple query that doesn't depend on specific models
    console.log('Attempting to execute a raw query...');
    
    // Use a raw query to test basic connectivity
    const result = await prisma.$runCommandRaw({
      ping: 1
    });
    
    console.log('Raw query result:', result);
    console.log('Connection successful!');
    
    return true;
  } catch (error) {
    console.error('Connection test failed with error:');
    console.error(error);
    
    // Check for specific error types
    if (error.message && error.message.includes('getaddrinfo')) {
      console.error('\nDNS RESOLUTION ERROR: Cannot resolve the MongoDB hostname.');
      console.error('This usually means:');
      console.error('1. Your internet connection has DNS issues');
      console.error('2. The MongoDB Atlas cluster no longer exists at this address');
      console.error('3. There may be network restrictions blocking access to MongoDB Atlas');
    } else if (error.message && error.message.includes('authentication failed')) {
      console.error('\nAUTHENTICATION ERROR: Invalid username or password in the connection string.');
    } else if (error.message && error.message.includes('SSL')) {
      console.error('\nSSL/TLS ERROR: There is an issue with the secure connection to MongoDB.');
    }
    
    return false;
  } finally {
    // Disconnect from Prisma
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
  }
}

// Run the test
testPrismaConnection()
  .then(success => {
    console.log('Test completed. Connection successful:', success);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed with unexpected error:', error);
    process.exit(1);
  });
