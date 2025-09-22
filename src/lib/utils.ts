import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Priority and status helpers
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "HIGH":
      return "red";
    case "MEDIUM":
      return "yellow";
    case "LOW":
      return "green";
    default:
      return "gray";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "green";
    case "IN_PROGRESS":
      return "blue";
    case "TODO":
      return "gray";
    default:
      return "gray";
  }
}
