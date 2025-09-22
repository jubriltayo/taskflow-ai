import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const tasks = await db.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
    },
    take: 5, // Only show recent tasks
  });

  const taskStats = {
    total: await db.task.count({ where: { userId: session.user.id } }),
    completed: await db.task.count({
      where: { userId: session.user.id, status: "COMPLETED" },
    }),
    inProgress: await db.task.count({
      where: { userId: session.user.id, status: "IN_PROGRESS" },
    }),
    todo: await db.task.count({
      where: { userId: session.user.id, status: "TODO" },
    }),
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
        <Button asChild>
          <Link href="/tasks">Manage Tasks</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-gray-900">
            {taskStats.total}
          </div>
          <div className="text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {taskStats.completed}
          </div>
          <div className="text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {taskStats.inProgress}
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="text-2xl font-bold text-gray-600">
            {taskStats.todo}
          </div>
          <div className="text-gray-600">To Do</div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Tasks</h2>
        </div>
        <div className="p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No tasks yet. Create your first task to get started!
              </p>
              <Button asChild className="mt-4">
                <Link href="/tasks">Create Task</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="flex gap-2 mt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          task.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          task.priority === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
