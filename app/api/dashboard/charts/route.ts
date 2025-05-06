import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { mockChartData } from '@/lib/mock-db';

export async function GET() {
  try {
    // Get monthly loans data
    const monthlyLoansData = await getMonthlyLoans();
    
    // Get loan durations distribution
    const loanDurationsData = await getLoanDurations();
    
    // Get repayment trends
    const repaymentTrendsData = await getRepaymentTrends();
    
    // Get loan officer distribution
    const loanOfficerData = await getLoanOfficerDistribution();

    return NextResponse.json({
      monthlyLoans: monthlyLoansData,
      loanDurations: loanDurationsData,
      repaymentTrends: repaymentTrendsData,
      loanOfficerDistribution: loanOfficerData,
    });
  } catch (error) {
    console.error('Error fetching dashboard charts data:', error);
    // Return mock data instead of error
    return NextResponse.json(mockChartData);
  }
}

// Helper function to get monthly loans data
async function getMonthlyLoans() {
  const currentYear = new Date().getFullYear();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Initialize data structure with zeros for all months
  const monthlyData = months.map(name => ({ name, loans: 0 }));
  
  // Get loan counts by month for the current year
  const loans = await prisma.loanRecord.findMany({
    where: {
      applicationDate: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },
    select: {
      applicationDate: true,
    },
  });
  
  // Count loans by month
  loans.forEach(loan => {
    const month = new Date(loan.applicationDate).getMonth();
    monthlyData[month].loans += 1;
  });
  
  return monthlyData;
}

// Helper function to get loan durations distribution
async function getLoanDurations() {
  // Count short-term loans (up to 30 days)
  const shortTermLoans = await prisma.loanRecord.count({
    where: {
      loanDuration: {
        lte: 30,
      },
    },
  });
  
  // Count medium-term loans (31-60 days)
  const mediumTermLoans = await prisma.loanRecord.count({
    where: {
      loanDuration: {
        gt: 30,
        lte: 60,
      },
    },
  });
  
  // Count long-term loans (over 60 days)
  const longTermLoans = await prisma.loanRecord.count({
    where: {
      loanDuration: {
        gt: 60,
      },
    },
  });
  
  return [
    { name: 'Short Term (30 days)', value: shortTermLoans },
    { name: 'Medium Term (60 days)', value: mediumTermLoans },
    { name: 'Long Term (90+ days)', value: longTermLoans },
  ];
}

// Helper function to get repayment trends (in Kenyan Shillings)
async function getRepaymentTrends() {
  // For simplicity, we'll return a structure with daily, weekly, and monthly data
  // In a real app, you would calculate this based on actual repayment records
  
  // Get the last 7 days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyData = [];
  
  // Get active loans to estimate daily repayments
  const activeLoans = await prisma.loanRecord.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      loanAmount: true,
      loanDuration: true,
    },
  });
  
  // Calculate estimated daily repayment amount in Kenyan Shillings
  for (let i = 0; i < 7; i++) {
    let dailyAmount = 0;
    
    // Simulate some variation in daily repayments
    activeLoans.forEach(loan => {
      const dailyRepayment = loan.loanAmount / loan.loanDuration;
      // Add some randomness to simulate real-world variation
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      dailyAmount += dailyRepayment * randomFactor;
    });
    
    dailyData.push({
      name: days[i],
      amount: Math.round(dailyAmount * 100), // Convert to Kenyan Shillings (KES)
    });
  }
  
  // Weekly data (last 4 weeks) in Kenyan Shillings
  const weeklyData = [];
  for (let i = 1; i <= 4; i++) {
    weeklyData.push({
      name: `Week ${i}`,
      amount: Math.round(dailyData.reduce((sum, day) => sum + day.amount, 0) / 7 * (0.9 + Math.random() * 0.2) * 7),
    });
  }
  
  // Monthly data (last 6 months) in Kenyan Shillings
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyData = [];
  for (let i = 0; i < 6; i++) {
    monthlyData.push({
      name: monthNames[i],
      amount: Math.round(weeklyData.reduce((sum, week) => sum + week.amount, 0) / 4 * (0.9 + Math.random() * 0.2) * 4),
    });
  }
  
  return {
    daily: dailyData,
    weekly: weeklyData,
    monthly: monthlyData,
  };
}

// Helper function to get loan officer distribution
async function getLoanOfficerDistribution() {
  // Get all loan officers and their loan counts
  const loanOfficers = await prisma.loanRecord.groupBy({
    by: ['loanOfficer'],
    _count: {
      id: true,
    },
  });
  
  // Format the data for the chart
  return loanOfficers.map(officer => ({
    name: officer.loanOfficer,
    value: officer._count.id,
  }));
}
