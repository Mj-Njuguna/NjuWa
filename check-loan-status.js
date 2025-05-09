const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get all loans
    const allLoans = await prisma.loanRecord.findMany({
      include: {
        client: {
          select: {
            name: true,
            idNumber: true,
          },
        },
      },
    });

    console.log('All Loans:');
    allLoans.forEach(loan => {
      console.log(`ID: ${loan.id}, Client: ${loan.client.name}, Amount: ${loan.loanAmount}, Status: ${loan.status}`);
    });
    
    // Get loan status counts
    const statusCounts = {};
    allLoans.forEach(loan => {
      statusCounts[loan.status] = (statusCounts[loan.status] || 0) + 1;
    });
    
    console.log('\nLoan Status Counts:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
