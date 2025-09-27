import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { TaskSchema } from "@/lib/validation";
import { TaskStatus, TaskPriority } from "@prisma/client";

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

    // Handle empty categoryId - convert to null
    const processedData = {
      ...json,
      categoryId: json.categoryId === "" ? null : json.categoryId,
    };

    const parsed = TaskSchema.safeParse(processedData);

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

    const { title, description, priority, dueDate, categoryId } = parsed.data;

    // Verify category belongs to user if provided (and not null/empty)
    if (categoryId) {
      const category = await db.category.findFirst({
        where: {
          id: categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 }
        );
      }
    }

    const task = await db.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        priority: priority as TaskPriority,
        status: TaskStatus.TODO,
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId: categoryId || null, // Ensure null if empty
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("❌ Task creation error:", error);
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as TaskStatus | null;
    const priority = searchParams.get("priority") as TaskPriority | null;
    const categoryId = searchParams.get("categoryId");

    const tasks = await db.task.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("Tasks fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
