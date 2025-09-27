"use client";

import { useState } from "react";
import type { TaskWithDetails, TaskUpdateInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditTaskDialog } from "./EditTaskDialog";
import {
  Calendar,
  Clock,
  Flag,
  MoreVertical,
  Play,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskStatus } from "@prisma/client";

interface TaskCardProps {
  task: TaskWithDetails;
  onUpdate: (
    taskId: string,
    updates: TaskUpdateInput
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (taskId: string) => Promise<{ success: boolean; error?: string }>;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatusLoading(newStatus);
    try {
      const result = await onUpdate(task.id, { status: newStatus });
      if (!result.success && result.error) {
        console.error("Error updating status:", result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setIsDeleting(true);
    try {
      const result = await onDelete(task.id);
      if (!result.success && result.error) {
        console.error("Error deleting task:", result.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: "Completed",
        };
      case "IN_PROGRESS":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Play,
          label: "In Progress",
        };
      default:
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: Circle,
          label: "To Do",
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          label: "High Priority",
        };
      case "MEDIUM":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          label: "Medium Priority",
        };
      default:
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          label: "Low Priority",
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const StatusIcon = statusConfig.icon;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "COMPLETED";

  return (
    <>
      <Card
        className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 border-slate-200/60 ${
          task.status === "COMPLETED" ? "bg-slate-50/30" : "bg-white"
        } ${isOverdue ? "border-l-4 border-l-red-400" : ""}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={() =>
                  handleStatusChange(
                    task.status === "COMPLETED"
                      ? TaskStatus.TODO
                      : TaskStatus.COMPLETED
                  )
                }
                className="mt-1 flex-shrink-0 transition-colors hover:scale-105"
                disabled={statusLoading !== null}
              >
                <StatusIcon
                  className={`h-5 w-5 ${
                    task.status === "COMPLETED"
                      ? "text-emerald-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                />
              </button>
              <div className="flex-1 min-w-0">
                <CardTitle
                  className={`text-lg font-semibold leading-tight text-balance ${
                    task.status === "COMPLETED"
                      ? "text-slate-500 line-through"
                      : "text-slate-900"
                  }`}
                >
                  {task.title}
                </CardTitle>
                {task.description && (
                  <p
                    className={`mt-2 text-sm leading-relaxed ${
                      task.status === "COMPLETED"
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isDeleting}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Task"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={`${statusConfig.color} font-medium px-2.5 py-1`}
            >
              {statusConfig.label}
            </Badge>
            <Badge
              variant="outline"
              className={`${priorityConfig.color} font-medium px-2.5 py-1`}
            >
              <Flag className="h-3 w-3 mr-1" />
              {priorityConfig.label}
            </Badge>
            {task.category && (
              <Badge
                variant="outline"
                className="font-medium px-2.5 py-1 border"
                style={{
                  backgroundColor: `${task.category.color}08`,
                  borderColor: `${task.category.color}40`,
                  color: task.category.color,
                }}
              >
                {task.category.name}
              </Badge>
            )}
          </div>

          {task.dueDate && (
            <div
              className={`flex items-center gap-2 text-sm ${
                isOverdue
                  ? "text-red-600 font-medium"
                  : task.status === "COMPLETED"
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>
                Due{" "}
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {isOverdue && " (Overdue)"}
              </span>
            </div>
          )}

          {task.status !== "COMPLETED" && (
            <div className="flex gap-2 pt-2">
              {task.status !== TaskStatus.TODO && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(TaskStatus.TODO)}
                  disabled={statusLoading !== null}
                  className="text-xs font-medium"
                >
                  {statusLoading === TaskStatus.TODO ? (
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Circle className="h-3 w-3 mr-1" />
                  )}
                  Mark as To Do
                </Button>
              )}
              {task.status !== TaskStatus.IN_PROGRESS && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                  disabled={statusLoading !== null}
                  className="text-xs font-medium"
                >
                  {statusLoading === TaskStatus.IN_PROGRESS ? (
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 mr-1" />
                  )}
                  Start Progress
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <EditTaskDialog
        task={task}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSave={onUpdate}
      />
    </>
  );
}
