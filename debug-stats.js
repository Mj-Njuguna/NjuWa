const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting debug of dashboard stats calculation...");
    
    // Get total loans count
    const totalLoans = await prisma.loanRecord.count();
    console.log(`Total loans: ${totalLoans}`);
    
    // Get active loans count
    const activeLoans = await prisma.loanRecord.count({
      where: {
        status: 'ACTIVE',
      },
    });
    console.log(`Active loans: ${activeLoans}`);
    
    // Get disbursed loans
    const disbursedLoans = await prisma.loanRecord.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'COMPLETED', 'DISBURSED'],
        },
      },
      select: {
        id: true,
        loanAmount: true,
        interestRate: true,
        status: true,
      },
    });
    
    console.log(`Disbursed loans found: ${disbursedLoans.length}`);
    console.log("Disbursed loans details:", JSON.stringify(disbursedLoans, null, 2));
    
    // Calculate totals
    let totalDisbursed = 0;
    let totalInterestEarned = 0;
    let totalActiveInterest = 0;
    
    // Process all disbursed loans
    disbursedLoans.forEach(loan => {
      console.log(`Processing loan: ${loan.id}, Status: ${loan.status}, Amount: ${loan.loanAmount}, Interest Rate: ${loan.interestRate}%`);
      
      // Add to total disbursed amount
      totalDisbursed += loan.loanAmount || 0;
      
      // Calculate interest amount
      const interestAmount = (loan.loanAmount || 0) * ((loan.interestRate || 0) / 100);
      console.log(`Calculated interest amount: ${interestAmount}`);
      
      // For completed loans, add to total interest earned
      if (loan.status === 'COMPLETED') {
        totalInterestEarned += interestAmount;
        console.log(`Added ${interestAmount} to totalInterestEarned (completed loan)`);
      }
      
      // For active loans, add to active interest
      if (loan.status === 'ACTIVE') {
        totalActiveInterest += interestAmount;
        console.log(`Added ${interestAmount} to totalActiveInterest (active loan)`);
        
        // Also add to total interest earned since this is the expected interest
        totalInterestEarned += interestAmount;
        console.log(`Added ${interestAmount} to totalInterestEarned (active loan)`);
      }
    });
    
    console.log("\nFinal calculated values:");
    console.log(`Total Disbursed: ${totalDisbursed}`);
    console.log(`Total Interest Earned: ${totalInterestEarned}`);
    console.log(`Total Active Interest: ${totalActiveInterest}`);
    
  } catch (error) {
    console.error('Error debugging stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
