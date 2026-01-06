import { z } from 'zod';

// Todo validation schemas
export const createTodoSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  dueDate: z.date().optional(),
  categoryId: z.number().optional().nullable(),
});

export const updateTodoSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  dueDate: z.date().nullable().optional(),
  isCompleted: z.boolean().optional(),
  categoryId: z.number().nullable().optional(),
  order: z.number().optional(),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters'),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(50, 'Category name must be less than 50 characters')
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .optional(),
  icon: z.string().optional(),
  isCollapsed: z.boolean().optional(),
  order: z.number().optional(),
});

// Password change validation
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Share category validation
export const shareCategorySchema = z.object({
  categoryId: z.number(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters'),
  permission: z.enum(['read', 'write']).default('read'),
});

// Type inference
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ShareCategoryInput = z.infer<typeof shareCategorySchema>;
