import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TasksList } from "@/components/tasks/TasksList";
import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";
import { TaskStatus, TaskPriority } from "@prisma/client";

// Server action for updating tasks
async function updateTask(taskId: string, updates: any) {
  "use server";

  try {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Verify task belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      throw new Error("Task not found");
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
        throw new Error("Category not found");
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

    const task = await db.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        category: true,
      },
    });

    console.log("✅ Task updated successfully:", task.id);
  } catch (error) {
    console.error("❌ Task update error:", error);
    throw error;
  }

  redirect("/tasks");
}

// Server action for deleting tasks - DIRECT DATABASE OPERATION
async function deleteTask(taskId: string) {
  "use server";

  try {
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Verify task belongs to user
    const existingTask = await db.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      throw new Error("Task not found");
    }

    await db.task.delete({
      where: { id: taskId },
    });

    console.log("✅ Task deleted successfully:", taskId);
  } catch (error) {
    console.error("❌ Task deletion error:", error);
    throw error;
  }

  redirect("/tasks");
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
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">
          Create, organize, and track your tasks
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Task Form - Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            <CreateTaskForm categories={categories} />
          </div>
        </div>

        {/* Tasks List - Main Content */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Your Tasks ({tasks.length})
            </h2>
          </div>

          <TasksList
            tasks={tasks}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
          />
        </div>
      </div>
    </div>
  );
}
