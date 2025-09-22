// Prisma models
import type {
  User,
  Task,
  Category,
  TaskStatus,
  TaskPriority,
} from "@prisma/client";

// Extended types for API responses
export interface UserWithTasks extends User {
  tasks: Task[];
  categories: Category[];
}

export interface TaskWithDetails extends Task {
  user: User;
  category: Category | null;
}

export interface CategoryWithTasks extends Category {
  user: User;
  tasks: Task[];
  _count: { tasks: number };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form/input types
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string | null;
  categoryId?: string | null;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  // This interface is intentionally empty to inherit properties from Partial<CreateCategoryInput>
  // and can be extended in the future if specific update fields are needed.
}

// Auth/User types
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}
export interface SessionUser extends AuthUser {
  emailVerified?: Date | null;
  image?: string | null;
}

// Dashboard stats
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  tasksByPriority: { high: number; medium: number; low: number };
  tasksByCategory: { category: string; count: number; color: string }[];
}

// Filtering & sorting
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  search?: string;
  dueDate?: "overdue" | "today" | "week" | "month";
}

export interface SortOptions {
  field: "createdAt" | "updatedAt" | "dueDate" | "priority" | "title";
  order: "asc" | "desc";
}

// Component props
export interface TaskCardProps {
  task: TaskWithDetails;
  onUpdate: (taskId: string, updates: UpdateTaskInput) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: (categoryId: string) => void;
}

export interface PriorityIndicatorProps {
  priority: TaskPriority;
  size?: "sm" | "md" | "lg";
}
export interface StatusBadgeProps {
  status: TaskStatus;
  size?: "sm" | "md" | "lg";
}

// Utility types
export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };
export type Prettify<T> = { [K in keyof T]: T[K] };

// Error handling
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export interface ValidationError {
  field: string;
  message: string;
}
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: ValidationError[];
}

