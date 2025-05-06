// Script to check the database and add a test record if needed
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking database for existing records...');
    
    // Check for existing clients
    const clientCount = await prisma.client.count();
    console.log(`Found ${clientCount} clients in the database.`);
    
    // Check for existing loan records
    const loanCount = await prisma.loanRecord.count();
    console.log(`Found ${loanCount} loan records in the database.`);
    
    // If no clients exist, create a test client
    if (clientCount === 0) {
      console.log('Creating a test client...');
      const client = await prisma.client.create({
        data: {
          name: 'John Doe',
          idNumber: 'KE123456789',
          phoneNumber1: '+254712345678',
          businessLocation: 'Nairobi CBD',
          homeAddress: '123 Main St, Nairobi',
        },
      });
      console.log('Test client created:', client);
    }
    
    // Get the first client (either existing or newly created)
    const client = await prisma.client.findFirst();
    
    // If no loan records exist, create a test loan record
    if (loanCount === 0 && client) {
      console.log('Creating a test loan record...');
      const today = new Date();
      const loanRecord = await prisma.loanRecord.create({
        data: {
          clientId: client.id,
          loanAmount: 50000, // 50,000 KES
          interestRate: 10, // 10%
          registrationFee: 1000, // 1,000 KES
          loanDuration: 30, // 30 days
          applicationDate: today,
          disbursementDate: today,
          firstInstallmentDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          lastInstallmentDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          loanOfficer: 'Jane Smith',
          status: 'ACTIVE', // Set as active loan
          dailyPaymentCheck: true,
        },
      });
      console.log('Test loan record created:', loanRecord);
    }
    
    // Verify records after creation
    const finalClientCount = await prisma.client.count();
    const finalLoanCount = await prisma.loanRecord.count();
    
    console.log(`Final count: ${finalClientCount} clients and ${finalLoanCount} loan records.`);
    
    if (finalLoanCount > 0) {
      // Get all loan records with client details
      const loans = await prisma.loanRecord.findMany({
        include: {
          client: true,
        },
      });
      
      console.log('Loan records with client details:');
      loans.forEach(loan => {
        console.log(`- Loan ID: ${loan.id}`);
        console.log(`  Amount: ${loan.loanAmount} KES`);
        console.log(`  Client: ${loan.client.name} (ID: ${loan.client.idNumber})`);
        console.log(`  Status: ${loan.status}`);
        console.log(`  Duration: ${loan.loanDuration} days`);
        console.log(`  Application Date: ${loan.applicationDate}`);
        console.log('---');
      });
    }
    
    console.log('Database check completed.');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
