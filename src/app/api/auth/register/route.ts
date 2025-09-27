import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth/utils";
import { RegisterSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = RegisterSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;
    const user = await createUser(email, password, name ?? undefined);

    // Create default categories
    const defaultCategories = [
      { name: "Work", color: "#3b82f6" },
      { name: "Personal", color: "#10b981" },
      { name: "Study", color: "#f59e0b" },
      { name: "Health", color: "#ef4444" },
    ];

    try {
      for (const category of defaultCategories) {
        await db.category.create({
          data: {
            name: category.name,
            color: category.color,
            userId: user.id,
          },
        });
      }
    } catch (categoryError) {
      console.error("Default category creation failed:", categoryError);
    }

    return NextResponse.json(
      {
        success: true,
        user,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Registration error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    const isConflict = message.includes("already exists");

    return NextResponse.json(
      {
        success: false,
        error: isConflict
          ? "User with this email already exists"
          : "Internal server error",
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}