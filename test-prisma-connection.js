// Test Prisma connection to MongoDB
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Testing MongoDB connection via Prisma...');
  
  // Create a new Prisma client
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Try to connect and perform a simple query
    console.log('Attempting to connect to the database...');
    
    // Get the count of loan records
    const loanCount = await prisma.loanRecord.count();
    console.log(`✅ Successfully connected to MongoDB!`);
    console.log(`Number of loan records: ${loanCount}`);
    
    // Get the count of clients
    const clientCount = await prisma.client.count();
    console.log(`Number of clients: ${clientCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
    console.log('Prisma connection closed');
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
