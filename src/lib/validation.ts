import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().max(50, "Name must be less than 50 characters").optional(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  dueDate: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name too long"),
  color: z.string().optional(),
});

// Extend schemas for form-specific validation
export const RegisterFormSchema = RegisterSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const LoginFormSchema = LoginSchema;
export const UpdateTaskSchema = TaskSchema.partial().extend({
  id: z.string().cuid(),
});
export const CreateCategorySchema = CategorySchema;
export const UpdateCategorySchema = CategorySchema.extend({
  id: z.string().cuid(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterFormInput = z.infer<typeof RegisterFormSchema>;
export type LoginFormInput = z.infer<typeof LoginFormSchema>;
export type TaskInput = z.infer<typeof TaskSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
