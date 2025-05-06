/**
 * Database error handler for Njuwa Capital application
 * Provides fallback data and error handling for database connection issues
 */

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Default fallback data for dashboard stats
export const defaultDashboardStats = {
  totalLoans: 0,
  activeLoans: 0,
  loansEndingSoon: 0,
  totalDisbursed: 0,
  totalInterest: 0,
  activeInterest: 0,
  loanStatusDistribution: {
    PENDING: 0,
    APPROVED: 0,
    DISBURSED: 0,
    ACTIVE: 0,
    COMPLETED: 0,
    DEFAULTED: 0,
    REJECTED: 0,
  }
};

// Default fallback data for dashboard charts
export const defaultChartData = {
  monthlyLoans: [],
  loansByStatus: [],
  loansByAmount: []
};

// Default fallback data for loans list
export const defaultLoansList = [];

/**
 * Handles database errors and provides fallback data
 * @param error The error object
 * @param fallbackData Default data to return in case of error
 * @param logMessage Custom log message
 * @returns Fallback data
 */
export function handleDatabaseError<T>(error: any, fallbackData: T, logMessage = "Database error"): T {
  // Log the error for debugging
  console.error(`${logMessage}:`, error);

  // Check if it's a Prisma connection error
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2010' || error.message.includes('connection')) {
      console.error('MongoDB connection error detected. Using fallback data.');
    }
  }

  // Return fallback data
  return fallbackData;
}

/**
 * Checks if MongoDB is available by attempting a simple query
 * @returns Promise<boolean> True if MongoDB is available, false otherwise
 */
export async function isMongoDbAvailable(prisma: any): Promise<boolean> {
  try {
    // Attempt a simple query with a short timeout
    await prisma.$queryRaw`db.runCommand({ ping: 1 })`;
    return true;
  } catch (error) {
    console.error('MongoDB availability check failed:', error);
    return false;
  }
}
