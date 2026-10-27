import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(120, { message: 'Title cannot exceed 120 characters' }),
  description: z.string().max(2000, { message: 'Description cannot exceed 2000 characters' }).optional(),
  status: z.enum(['backlog', 'todo', 'in-progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' })
    .max(120, { message: 'Title cannot exceed 120 characters' })
    .optional(),
  description: z.string().max(2000, { message: 'Description cannot exceed 2000 characters' }).optional(),
  status: z.enum(['backlog', 'todo', 'in-progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .min(1, { message: 'Comment content cannot be empty' })
    .max(2000, { message: 'Comment cannot exceed 2000 characters' }),
  authorId: z.string().optional(),
});
