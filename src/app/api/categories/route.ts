import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { CategorySchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = CategorySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, color } = parsed.data;

    // Check if category name already exists for this user
    const existingCategory = await db.category.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category name already exists" },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        color: color || "#6366f1",
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const categories = await db.category.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
