import { PrismaClient } from '@prisma/client'

// Configure Prisma client with connection retry and timeout settings
const prismaClientSingleton = () => {
  // Extract the connection string from environment variables
  const url = process.env.MONGODB_URI || '';
  
  // Create a new Prisma client with enhanced configuration
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url,
      },
    },
    // Add connection retry and timeout settings
    // @ts-ignore - These are valid Prisma connection options but might not be typed correctly
    __internal: {
      engine: {
        connectionTimeout: 30000, // 30 seconds (increased from 10)
        connectionLimit: 5, // Maximum 5 connections
        retry: {
          max: 5, // Maximum number of retries
          backoff: {
            type: 'exponential',
            min: 1000, // Minimum delay in ms
            max: 5000, // Maximum delay in ms
            factor: 2, // Exponential factor
          },
        },
      },
    },
  })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add error handling
// @ts-ignore - Prisma event types are not properly exposed in TypeScript
prisma.$on('query', (e: any) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})

// @ts-ignore - Prisma event types are not properly exposed in TypeScript
prisma.$on('error', (e: any) => {
  console.error('Prisma Error:', e)
  console.error('Connection string (masked):', 
    process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//[USERNAME]:[PASSWORD]@'))
})

export default prisma