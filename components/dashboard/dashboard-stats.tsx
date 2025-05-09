"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCircle, Coins, DollarSign, TrendingUp, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface DashboardStatsData {
  totalLoans: number;
  activeLoans: number;
  loansEndingSoon: number;
  totalDisbursed: number;
  totalInterestEarned: number;
  totalActiveInterest: number;
  totalExpectedReturn: number;
  totalActiveExpectedReturn: number;
  statusDistribution?: Array<{
    status: string;
    count: number;
  }>;
  loanStatusDistribution?: {
    PENDING?: number;
    APPROVED?: number;
    ACTIVE?: number;
    COMPLETED?: number;
    DEFAULTED?: number;
    [key: string]: number | undefined;
  };
  upcomingPayments: Array<{
    id: string;
    clientName: string;
    clientId: string;
    phoneNumber: string;
    dueDate: string;
    amount: number;
  }>;
}

export default function DashboardStats() {
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);
        console.log('Fetching dashboard stats...');
        const response = await fetch('/api/dashboard/stats', {
          // Add cache busting parameter to prevent caching
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          // Add timestamp to force a fresh request
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        
        const data = await response.json();
        console.log('Dashboard stats data received:', data);
        console.log('Total disbursed amount:', data.totalDisbursed);
        console.log('Total interest earned:', data.totalInterestEarned);
        console.log('Active interest:', data.totalActiveInterest);
        
        // Force a clean data object with numeric values
        const cleanData = {
          ...data,
          totalLoans: Number(data.totalLoans) || 0,
          activeLoans: Number(data.activeLoans) || 0,
          loansEndingSoon: Number(data.loansEndingSoon) || 0,
          totalDisbursed: Number(data.totalDisbursed) || 0,
          totalInterestEarned: Number(data.totalInterestEarned) || 0,
          totalActiveInterest: Number(data.totalActiveInterest) || 0,
          totalExpectedReturn: Number(data.totalExpectedReturn) || 0,
          totalActiveExpectedReturn: Number(data.totalActiveExpectedReturn) || 0,
          // Ensure loan status distribution is properly formatted
          loanStatusDistribution: data.loanStatusDistribution || {},
        };
        
        console.log('Cleaned data:', cleanData);
        console.log('Loan status distribution:', cleanData.loanStatusDistribution);
        console.log('Completed loans:', cleanData.loanStatusDistribution?.COMPLETED || 0);
        setStatsData(cleanData);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  // If loading, show skeleton UI
  if (loading) {
    console.log('Dashboard stats is loading...');
    return (
      <div className="space-y-4 mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </CardTitle>
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    console.log('Dashboard stats error:', error);
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 mb-8">
        {error}
      </div>
    );
  }

  // If no data, show empty state
  if (!statsData) {
    console.log('No dashboard stats data available');
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-blue-600 dark:text-blue-400 mb-8">
        No dashboard statistics available. Start by creating loan records.
      </div>
    );
  }

  console.log('Rendering dashboard stats with data:', statsData);

  // Helper function to format currency values with fallback to 0
  const formatCurrency = (value: number | undefined | null) => {
    // Ensure the value is a number and default to 0 if undefined, null, or NaN
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  // Ensure all values are proper numbers before formatting
  console.log('Before formatting - totalDisbursed:', statsData.totalDisbursed, typeof statsData.totalDisbursed);
  console.log('Before formatting - totalInterestEarned:', statsData.totalInterestEarned, typeof statsData.totalInterestEarned);
  
  // Format all monetary values with the helper function
  const formattedTotalDisbursed = formatCurrency(Number(statsData.totalDisbursed));
  const formattedTotalInterest = formatCurrency(Number(statsData.totalInterestEarned));
  const formattedActiveInterest = formatCurrency(Number(statsData.totalActiveInterest));
  const formattedExpectedReturn = formatCurrency(Number(statsData.totalExpectedReturn));
  const formattedActiveExpectedReturn = formatCurrency(Number(statsData.totalActiveExpectedReturn));
  
  console.log('After formatting:');
  console.log('formattedTotalDisbursed:', formattedTotalDisbursed);
  console.log('formattedTotalInterest:', formattedTotalInterest);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Calculate percentage of completed loans
  const completedPercentage = statsData.totalLoans > 0 
    ? Math.round((statsData.loanStatusDistribution?.COMPLETED || 0) / statsData.totalLoans * 100) 
    : 0;

  // Main stats
  const stats = [
    {
      title: "Total Loans",
      value: statsData.totalLoans.toString(),
      description: "Total loans processed",
      icon: <Coins className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      change: statsData.totalLoans > 0 
        ? `${completedPercentage}% completed, ${((statsData.activeLoans / statsData.totalLoans) * 100).toFixed(0)}% active` 
        : "No loans",
      changeType: "neutral",
    },
    {
      title: "Active Loans",
      value: statsData.activeLoans.toString(),
      description: "Currently active loans",
      icon: <Users className="h-5 w-5 text-green-600 dark:text-green-400" />,
      change: statsData.loansEndingSoon > 0 
        ? `${statsData.loansEndingSoon} ending soon` 
        : statsData.activeLoans === 0 && statsData.totalLoans > 0 
          ? "All loans completed" 
          : "None ending soon",
      changeType: "neutral",
    },
    {
      title: "Total Disbursed",
      value: formattedTotalDisbursed,
      description: "Capital disbursed",
      icon: (
        <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      ),
      change: statsData.totalDisbursed > 0 
        ? `${((statsData.totalInterestEarned / statsData.totalDisbursed) * 100).toFixed(1)}% interest rate` 
        : "0% interest rate",
      changeType: "positive",
    },
    {
      title: "Expected Return",
      value: formattedExpectedReturn,
      description: "Total principal + interest",
      icon: (
        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      ),
      change: statsData.activeLoans > 0 
        ? `${formattedActiveExpectedReturn} from active loans` 
        : statsData.totalLoans > 0 
          ? "All loans completed" 
          : "No active loans",
      changeType: "positive",
    },
    {
      title: "Interest Earned",
      value: formattedTotalInterest,
      description: "Total interest earned",
      icon: (
        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      ),
      change: statsData.activeLoans > 0 
        ? `${formattedActiveInterest} from active loans` 
        : statsData.totalLoans > 0 
          ? "All from completed loans" 
          : "No interest earned",
      changeType: "positive",
    },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Main stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <p className={`text-xs font-medium mt-2 ${
                stat.changeType === 'positive' 
                  ? 'text-green-600 dark:text-green-400' 
                  : stat.changeType === 'negative' 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-600 dark:text-gray-400'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {statsData.upcomingPayments && statsData.upcomingPayments.length > 0 ? (
            <div className="space-y-4">
              {statsData.upcomingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {payment.clientName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{payment.clientName}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>ID: {payment.clientId}</span>
                        <span>•</span>
                        <span>{payment.phoneNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat('en-KE', {
                        style: 'currency',
                        currency: 'KES',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(payment.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <Link href={`/records/${payment.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No upcoming payments in the next 7 days
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}