"use client";

import { useState } from "react";
import { TaskWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditTaskDialog } from "./EditTaskDialog";
import { Category } from "@prisma/client";

interface TaskCardProps {
  task: TaskWithDetails;
  onUpdate: (taskId: string, updates: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(newStatus);
    try {
      await onUpdate(task.id, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
              {task.title}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isDeleting}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace("_", " ")}
            </Badge>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            {task.category && (
              <Badge
                className="bg-purple-100 text-purple-800"
                style={{
                  backgroundColor: `${task.category.color}20`,
                  color: task.category.color,
                }}
              >
                {task.category.name}
              </Badge>
            )}
          </div>

          {task.dueDate && (
            <div className="text-xs text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}

          <div className="flex gap-2">
            {task.status !== "TODO" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("TODO")}
                disabled={statusLoading !== null}
              >
                {statusLoading === "TODO" ? "..." : "Mark as Todo"}
              </Button>
            )}
            {task.status !== "IN_PROGRESS" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("IN_PROGRESS")}
                disabled={statusLoading !== null}
              >
                {statusLoading === "IN_PROGRESS" ? "..." : "Start Progress"}
              </Button>
            )}
            {task.status !== "COMPLETED" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("COMPLETED")}
                disabled={statusLoading !== null}
              >
                {statusLoading === "COMPLETED" ? "..." : "Complete"}
              </Button>
            )}
          </div>
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
