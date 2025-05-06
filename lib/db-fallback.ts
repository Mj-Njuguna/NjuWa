/**
 * Database fallback system for Njuwa Capital
 * 
 * This file provides fallback mechanisms for database operations when MongoDB is unavailable.
 * It intercepts Prisma calls and returns mock data instead.
 */

import { mockClients, mockLoanRecords, mockGuarantors, mockReferences, 
  mockMediaFiles, mockDashboardStats, mockChartData, mockRecentLoans } from './mock-db';
import { PrismaClient } from '@prisma/client';

// Timeout for database operations (ms)
const DB_OPERATION_TIMEOUT = 5000;

/**
 * Checks if the database is available
 * @param prisma PrismaClient instance
 * @returns Promise<boolean> true if database is available, false otherwise
 */
export async function isDatabaseAvailable(prisma: PrismaClient): Promise<boolean> {
  try {
    // Set up a timeout for the database check
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Database connection timeout')), DB_OPERATION_TIMEOUT);
    });

    // Try a simple database operation
    const dbCheckPromise = prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

    // Race the database check against the timeout
    return await Promise.race([dbCheckPromise, timeoutPromise]) as boolean;
  } catch (error) {
    console.error('Database availability check failed:', error);
    return false;
  }
}

/**
 * Wrapper for database operations with fallback to mock data
 * @param operation The database operation to perform
 * @param fallbackData The mock data to return if the operation fails
 * @param operationName Name of the operation for logging
 * @returns Result of the operation or fallback data
 */
export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallbackData: T,
  operationName: string = 'Database operation'
): Promise<T> {
  try {
    // Set up a timeout for the operation
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${operationName} timeout`)), DB_OPERATION_TIMEOUT);
    });

    // Try the actual database operation
    const operationPromise = operation();

    // Race the operation against the timeout
    return await Promise.race([operationPromise, timeoutPromise]);
  } catch (error) {
    console.error(`${operationName} failed, using fallback data:`, error);
    return fallbackData;
  }
}

/**
 * Get all loan records with fallback
 * @param prisma PrismaClient instance
 * @returns Array of loan records
 */
export async function getAllLoansWithFallback(prisma: PrismaClient) {
  return withDatabaseFallback(
    () => prisma.loanRecord.findMany({
      include: {
        client: true,
        guarantors: true,
        references: true,
        mediaFiles: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    mockRecentLoans,
    'Get all loans'
  );
}

/**
 * Get dashboard statistics with fallback
 * @param prisma PrismaClient instance
 * @returns Dashboard statistics
 */
export async function getDashboardStatsWithFallback(prisma: PrismaClient) {
  return withDatabaseFallback(
    async () => {
      // Your actual database query for dashboard stats
      const totalLoans = await prisma.loanRecord.count();
      const activeLoans = await prisma.loanRecord.count({
        where: { status: 'ACTIVE' },
      });
      // ... other stats calculations
      
      return {
        totalLoans,
        activeLoans,
        // ... other stats
      };
    },
    mockDashboardStats,
    'Get dashboard stats'
  );
}

/**
 * Get dashboard chart data with fallback
 * @param prisma PrismaClient instance
 * @returns Chart data
 */
export async function getChartDataWithFallback(prisma: PrismaClient) {
  return withDatabaseFallback(
    async () => {
      // Your actual database query for chart data
      // ...
      
      return {
        // ... chart data
      };
    },
    mockChartData,
    'Get chart data'
  );
}
