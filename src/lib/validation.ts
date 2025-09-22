import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  dueDate: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(), // REMOVED .cuid() validation
});

export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name too long"),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
});

export const UpdateTaskSchema = TaskSchema.partial().extend({
  id: z.string().cuid(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type TaskInput = z.infer<typeof TaskSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
