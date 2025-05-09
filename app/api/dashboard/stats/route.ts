import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addDays } from 'date-fns';
import { getDashboardStatsWithFallback } from '@/lib/db-fallback';
import { mockDashboardStats } from '@/lib/mock-db';

export async function GET() {
  try {
    // Skip the fallback system and always use real database data
    // const fallbackStats = await getDashboardStatsWithFallback(prisma);
    // 
    // if (fallbackStats) {
    //   return NextResponse.json(fallbackStats);
    // }
    
    console.log('Fetching real dashboard stats from database...');
    
    // Otherwise proceed with normal database operations
    // Get total loans count
    const totalLoans = await prisma.loanRecord.count();
    
    // Get active loans count - these are loans that have been disbursed and are being repaid
    const activeLoans = await prisma.loanRecord.count({
      where: {
        status: 'ACTIVE',
      },
    });
    
    // Get loans ending soon (in the next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    const loansEndingSoon = await prisma.loanRecord.count({
      where: {
        status: 'ACTIVE',
        lastInstallmentDate: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
    });
    
    // Get total disbursed amount - include both ACTIVE and COMPLETED loans
    // since both statuses mean the loan has been disbursed
    const disbursedLoans = await prisma.loanRecord.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'COMPLETED'], // Only consider ACTIVE and COMPLETED loans as disbursed
        },
      },
      select: {
        loanAmount: true,
        interestRate: true,
        status: true,
      },
    });
    
    // Initialize all monetary values to 0 to avoid NaN issues
    let totalDisbursed = 0;
    let totalInterestEarned = 0;
    let totalActiveInterest = 0;
    let totalExpectedReturn = 0;
    let totalActiveExpectedReturn = 0;
    
    // Define types for loan data
    interface LoanData {
      loanAmount: number;
      interestRate: number;
      status: string;
    }
    
    // Process all disbursed loans
    disbursedLoans.forEach((loan: LoanData) => {
      console.log(`Processing loan with status: ${loan.status}, amount: ${loan.loanAmount}, interest rate: ${loan.interestRate}%`);
      
      // Add to total disbursed amount for all loans that have been disbursed
      // This includes ACTIVE and COMPLETED loans
      totalDisbursed += loan.loanAmount || 0;
      
      // Calculate interest amount
      const interestAmount = (loan.loanAmount || 0) * ((loan.interestRate || 0) / 100);
      console.log(`Calculated interest amount: ${interestAmount}`);
      
      // Calculate expected return (principal + interest)
      const expectedReturn = (loan.loanAmount || 0) + interestAmount;
      
      // Handle interest calculations based on loan status
      if (loan.status === 'COMPLETED') {
        // For completed loans, the interest has been fully earned
        totalInterestEarned += interestAmount;
        console.log(`Added ${interestAmount} to totalInterestEarned (completed loan)`);
      } 
      else if (loan.status === 'ACTIVE') {
        // For active loans, track both active interest and expected return
        totalActiveInterest += interestAmount;
        totalActiveExpectedReturn += expectedReturn;
        
        // Also add to total interest earned since this is expected to be earned
        totalInterestEarned += interestAmount;
        console.log(`Added ${interestAmount} to totalInterestEarned and totalActiveInterest (active loan)`);
      }
      
      // Add to total expected return for all loan types
      totalExpectedReturn += expectedReturn;
    });
    
    console.log('Final calculated values:');
    console.log(`Total Disbursed: ${totalDisbursed}`);
    console.log(`Total Interest Earned: ${totalInterestEarned}`);
    console.log(`Total Active Interest: ${totalActiveInterest}`);
    
    // Get upcoming payments (loans with payments due in the next 7 days)
    const sevenDaysFromNow = addDays(today, 7);
    
    const upcomingPayments = await prisma.loanRecord.findMany({
      where: {
        status: 'ACTIVE',
        firstInstallmentDate: {
          gte: today,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        client: {
          select: {
            name: true,
            idNumber: true,
            phoneNumber1: true,
          },
        },
      },
      orderBy: {
        firstInstallmentDate: 'asc',
      },
      take: 5,
    });
    
    // Define interface for payment data
    interface PaymentData {
      id: string;
      loanAmount: number;
      interestRate: number;
      loanDuration: number;
      firstInstallmentDate: Date;
      client: {
        name: string;
        idNumber: string;
        phoneNumber1: string;
      };
    }
    
    // Format the upcoming payments data
    const formattedUpcomingPayments = upcomingPayments.map((payment: PaymentData) => {
      // Calculate payment amount in Kenyan Shillings
      const totalPayable = (payment.loanAmount || 0) + ((payment.loanAmount || 0) * (payment.interestRate || 0) / 100);
      const installmentAmount = payment.loanDuration > 0 ? totalPayable / payment.loanDuration : 0;
      
      return {
        id: payment.id,
        clientName: payment.client.name,
        clientId: payment.client.idNumber,
        phoneNumber: payment.client.phoneNumber1,
        dueDate: payment.firstInstallmentDate,
        amount: Math.round(installmentAmount * 100) / 100, // Round to 2 decimal places
        currency: 'KES', // Add currency code for Kenyan Shillings
      };
    });
    
    // Get loan status distribution - only include the four main statuses
    const loanStatusDistribution = {
      PENDING: await prisma.loanRecord.count({ where: { status: 'PENDING' } }),
      ACTIVE: await prisma.loanRecord.count({ where: { status: 'ACTIVE' } }),
      COMPLETED: await prisma.loanRecord.count({ where: { status: 'COMPLETED' } }),
      DEFAULTED: await prisma.loanRecord.count({ where: { status: 'DEFAULTED' } }),
    };
    
    // Return the stats with all monetary values defaulting to 0 if undefined
    return NextResponse.json({
      totalLoans: totalLoans || 0,
      activeLoans: activeLoans || 0,
      loansEndingSoon: loansEndingSoon || 0,
      totalDisbursed: totalDisbursed || 0,
      totalInterestEarned: totalInterestEarned || 0,
      totalActiveInterest: totalActiveInterest || 0,
      totalExpectedReturn: totalExpectedReturn || 0,
      totalActiveExpectedReturn: totalActiveExpectedReturn || 0,
      upcomingPayments: formattedUpcomingPayments || [],
      loanStatusDistribution: loanStatusDistribution || {},
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data if all else fails
    return NextResponse.json(mockDashboardStats);
  }
}
