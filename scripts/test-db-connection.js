// Test script to check MongoDB connection
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Try to get the count of loan records
    const loanCount = await prisma.loanRecord.count();
    console.log(`Connection successful! Found ${loanCount} loan records.`);
    
    // Try to get a list of clients
    const clients = await prisma.client.findMany({
      take: 5, // Limit to 5 clients
    });
    
    console.log(`Found ${clients.length} clients.`);
    if (clients.length > 0) {
      console.log('Sample client data:');
      console.log(JSON.stringify(clients[0], null, 2));
    }
    
    console.log('Database connection test completed successfully.');
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
