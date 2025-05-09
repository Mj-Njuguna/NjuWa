const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get all active loans
    const activeLoans = await prisma.loanRecord.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        client: {
          select: {
            name: true,
            idNumber: true,
          },
        },
      },
    });

    console.log('Active Loans:');
    console.log(JSON.stringify(activeLoans, null, 2));
    
    // Get all loan statuses for debugging
    const loanStatusCounts = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count 
      FROM "LoanRecord" 
      GROUP BY status
    `;
    
    console.log('\nLoan Status Distribution:');
    console.log(JSON.stringify(loanStatusCounts, null, 2));
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
