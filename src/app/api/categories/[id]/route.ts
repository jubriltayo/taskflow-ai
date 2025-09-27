import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { CategorySchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify category belongs to user
    const existingCategory = await db.category.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const { name, color } = parsed.data;

    // Check if category name already exists for this user (excluding current category)
    const duplicateCategory = await db.category.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        NOT: {
          id: id,
        },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, error: "Category name already exists" },
        { status: 409 }
      );
    }

    const category = await db.category.update({
      where: { id: id },
      data: {
        name: name.trim(),
        color: color || "#6366f1",
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify category belongs to user
    const existingCategory = await db.category.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Prevent deletion if category has tasks
    if (existingCategory._count.tasks > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete category with existing tasks. Please reassign or delete the tasks first.",
        },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Category deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
