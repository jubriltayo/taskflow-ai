"use client";

import { TaskWithDetails } from "@/types";
import { TaskCard } from "./TaskCard";

interface TasksListProps {
  tasks: TaskWithDetails[];
  onTaskUpdate: (taskId: string, updates: any) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
}

export function TasksList({
  tasks,
  onTaskUpdate,
  onTaskDelete,
}: TasksListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No tasks found</div>
        <p className="text-gray-400 mt-2">
          Create your first task to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={onTaskUpdate}
          onDelete={onTaskDelete}
        />
      ))}
    </div>
  );
}
