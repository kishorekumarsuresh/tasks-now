import { z } from 'zod';

export const createTaskSchema = {
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(255, 'Title is too long'),
    description: z.string().optional(),
  }),
};

export const updateTaskSchema = {
  params: z.object({
    id: z.string().uuid('Invalid task ID. Must be a valid UUID'),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  }),
};

export const taskIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid task ID. Must be a valid UUID'),
  }),
};

export const getTasksQuerySchema = {
  query: z.object({
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
    offset: z.coerce.number().min(0).default(0).optional(),
  }),
};