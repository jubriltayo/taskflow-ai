import { getServerSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  TrendingUp,
} from "lucide-react";

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
    take: 6,
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

  const completionRate =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Good{" "}
              {new Date().getHours() < 12
                ? "morning"
                : new Date().getHours() < 18
                ? "afternoon"
                : "evening"}
            </h1>
            <p className="text-muted-foreground">
              Welcome back,{" "}
              {session.user.name || session.user.email?.split("@")[0]}
            </p>
          </div>
          <Button asChild size="lg" className="group">
            <Link href="/tasks" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-bold">{taskStats.total}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {taskStats.completed}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {taskStats.inProgress}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                Recent Tasks
              </CardTitle>
              <Button variant="outline" asChild>
                <Link href="/tasks">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Create your first task to start organizing your work and boost
                  your productivity.
                </p>
                <Button asChild>
                  <Link href="/tasks">Create Your First Task</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          task.status === "COMPLETED"
                            ? "bg-green-500"
                            : task.status === "IN_PROGRESS"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
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
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              task.priority === "HIGH"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.category && (
                            <span
                              className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white"
                              style={{ backgroundColor: task.category.color }}
                            >
                              {task.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
