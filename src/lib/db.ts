import { PrismaClient } from "@prisma/client";

/**
 * Global Prisma client instance for database operations
 * Uses singleton pattern to prevent multiple instances in development
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Utility function to handle database connection errors
 */
export async function connectToDatabase() {
  try {
    await db.$connect();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

/**
 * Utility function to safely disconnect from database
 */
export async function disconnectFromDatabase() {
  try {
    await db.$disconnect();
  } catch (error) {
    console.error("❌ Database disconnection failed:", error);
  }
}
