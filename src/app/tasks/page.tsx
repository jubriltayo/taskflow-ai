// app/tasks/page.tsx
import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TasksList } from "@/components/tasks/TasksList";
import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";
import { CategoryManager } from "@/components/categories/CategoryManager";
import { revalidatePath } from "next/cache";
import type { TaskWithDetails } from "@/types";

// Define the return type for server actions
interface ServerActionResponse {
  success: boolean;
  error?: string;
}

// Server action for updating tasks - FIXED VERSION
async function updateTask(
  taskId: string,
  updates: any
): Promise<ServerActionResponse> {
  "use server";

  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify task belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    // Verify category belongs to user if provided
    if (updates.categoryId && updates.categoryId !== "none") {
      const category = await db.category.findFirst({
        where: {
          id: updates.categoryId,
          userId: session.user.id,
        },
      });

      if (!category) {
        return { success: false, error: "Category not found" };
      }
    }

    // Prepare update data
    const updateData: any = {
      title: updates.title,
      description: updates.description,
      status: updates.status,
      priority: updates.priority,
      dueDate: updates.dueDate ? new Date(updates.dueDate) : null,
      categoryId: updates.categoryId || null,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await db.task.update({
      where: { id: taskId },
      data: updateData,
    });

    console.log("✅ Task updated successfully:", taskId);

    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    console.error("❌ Task update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Server action for deleting tasks - FIXED VERSION
async function deleteTask(taskId: string): Promise<ServerActionResponse> {
  "use server";

  try {
    const session = await getServerSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify task belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return { success: false, error: "Task not found" };
    }

    await db.task.delete({
      where: { id: taskId },
    });

    console.log("✅ Task deleted successfully:", taskId);

    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    console.error("❌ Task deletion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export default async function TasksPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch tasks and categories in parallel
  const [tasks, categories] = await Promise.all([
    db.task.findMany({
      where: { userId: session.user.id },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const tasksWithDetails = tasks as unknown as TaskWithDetails[];

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">
          Create, organize, and track your tasks
        </p>
      </div>

      {/* Three-column layout */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Create Task Form - Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
              <CreateTaskForm categories={categories} />
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
              <CategoryManager categories={categories} />
            </div>
          </div>
        </div>

        {/* Tasks List - Main Content */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Your Tasks ({tasks.length})
            </h2>
          </div>

          <TasksList
            tasks={tasksWithDetails}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
          />
        </div>
      </div>
    </div>
  );
}
