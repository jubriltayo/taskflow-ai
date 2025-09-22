import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { UpdateTaskSchema } from "@/lib/validation";
import { TaskStatus, TaskPriority } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = UpdateTaskSchema.safeParse({ ...json, id: params.id });

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

    // Verify task belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Verify category belongs to user if provided
    if (json.categoryId) {
      const category = await db.category.findFirst({
        where: {
          id: json.categoryId,
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

    const task = await db.task.update({
      where: { id: params.id },
      data: {
        ...json,
        dueDate: json.dueDate ? new Date(json.dueDate) : null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify task belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    await db.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Task deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
