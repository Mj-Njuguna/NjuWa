import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addDays } from 'date-fns';
import { getDashboardStatsWithFallback } from '@/lib/db-fallback';
import { mockDashboardStats } from '@/lib/mock-db';

export async function GET() {
  try {
    // Try to use the fallback system first
    const fallbackStats = await getDashboardStatsWithFallback(prisma);
    
    // If we get fallback data, return it
    if (fallbackStats) {
      return NextResponse.json(fallbackStats);
    }
    
    // Otherwise proceed with normal database operations
    // Get total loans count
    const totalLoans = await prisma.loanRecord.count();
    
    // Get active loans count
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
    
    // Get total disbursed amount and interest earned (in Kenyan Shillings)
    const loanStats = await prisma.loanRecord.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'COMPLETED'],
        },
      },
      select: {
        loanAmount: true,
        interestRate: true,
        status: true,
      },
    });
    
    let totalDisbursed = 0;
    let totalInterestEarned = 0;
    let totalActiveInterest = 0;
    let totalExpectedReturn = 0;
    let totalActiveExpectedReturn = 0;
    
    loanStats.forEach(loan => {
      totalDisbursed += loan.loanAmount;
      
      // Calculate interest amount
      const interestAmount = loan.loanAmount * (loan.interestRate / 100);
      totalInterestEarned += interestAmount;
      
      // Calculate expected return (principal + interest)
      const expectedReturn = loan.loanAmount + interestAmount;
      totalExpectedReturn += expectedReturn;
      
      // Calculate active interest and expected return
      if (loan.status === 'ACTIVE') {
        totalActiveInterest += interestAmount;
        totalActiveExpectedReturn += expectedReturn;
      }
    });
    
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
    
    // Format the upcoming payments data
    const formattedUpcomingPayments = upcomingPayments.map(payment => {
      // Calculate payment amount in Kenyan Shillings (simple calculation - can be refined based on business logic)
      const totalPayable = payment.loanAmount + (payment.loanAmount * payment.interestRate / 100);
      const installmentAmount = totalPayable / payment.loanDuration;
      
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
    
    // Get loan status distribution
    const loanStatusDistribution = {
      PENDING: await prisma.loanRecord.count({ where: { status: 'PENDING' } }),
      APPROVED: await prisma.loanRecord.count({ where: { status: 'APPROVED' } }),
      DISBURSED: await prisma.loanRecord.count({ where: { status: 'DISBURSED' } }),
      ACTIVE: await prisma.loanRecord.count({ where: { status: 'ACTIVE' } }),
      COMPLETED: await prisma.loanRecord.count({ where: { status: 'COMPLETED' } }),
      DEFAULTED: await prisma.loanRecord.count({ where: { status: 'DEFAULTED' } }),
      REJECTED: await prisma.loanRecord.count({ where: { status: 'REJECTED' } }),
    };
    
    return NextResponse.json({
      totalLoans,
      activeLoans,
      loansEndingSoon,
      totalDisbursed,
      totalInterestEarned,
      totalActiveInterest,
      totalExpectedReturn,
      totalActiveExpectedReturn,
      upcomingPayments: formattedUpcomingPayments,
      loanStatusDistribution,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return mock data if all else fails
    return NextResponse.json(mockDashboardStats);
  }
}
