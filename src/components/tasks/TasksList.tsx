"use client";

import type { TaskWithDetails, TaskUpdateInput } from "@/types";
import { TaskCard } from "./TaskCard";
import { CheckCircle2, Clock, Circle } from "lucide-react";

interface TasksListProps {
  tasks: TaskWithDetails[];
  onTaskUpdate: (
    taskId: string,
    updates: TaskUpdateInput
  ) => Promise<{ success: boolean; error?: string }>;
  onTaskDelete: (
    taskId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export function TasksList({
  tasks,
  onTaskUpdate,
  onTaskDelete,
}: TasksListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-slate-400" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Circle className="h-3 w-3 text-blue-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">
          No tasks yet
        </h3>
        <p className="text-slate-600 text-center max-w-sm leading-relaxed">
          Create your first task to start organizing your work and boost your
          productivity.
        </p>
      </div>
    );
  }

  const groupedTasks = {
    TODO: tasks.filter((task) => task.status === "TODO"),
    IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS"),
    COMPLETED: tasks.filter((task) => task.status === "COMPLETED"),
  };

  const statusConfig = {
    TODO: { label: "To Do", icon: Circle, color: "text-slate-600" },
    IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-600" },
    COMPLETED: {
      label: "Completed",
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedTasks).map(([status, statusTasks]) => {
        if (statusTasks.length === 0) return null;

        const config = statusConfig[status as keyof typeof statusConfig];
        const StatusIcon = config.icon;

        return (
          <div key={status} className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
              <StatusIcon className={`h-5 w-5 ${config.color}`} />
              <h3 className="font-semibold text-slate-900">{config.label}</h3>
              <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {statusTasks.length}
              </span>
            </div>
            <div className="grid gap-4">
              {statusTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
