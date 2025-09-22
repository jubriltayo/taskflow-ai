// app/api/tasks/test/route.ts - Create this file for testing
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      message: "API is working",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
