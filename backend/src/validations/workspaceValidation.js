import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string({ required_error: 'Workspace name is required' })
    .min(2, { message: 'Workspace name must be at least 2 characters' })
    .max(100, { message: 'Workspace name cannot exceed 100 characters' }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters' })
    .max(50, { message: 'Slug cannot exceed 50 characters' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug can only contain lowercase letters, numbers, and hyphens',
    })
    .optional(),
  ownerEmail: z
    .string({ required_error: 'Owner email is required' })
    .email({ message: 'A valid email address is required' }),
  ownerName: z
    .string({ required_error: 'Owner name is required' })
    .min(2, { message: 'Owner name must be at least 2 characters' }),
  description: z.string().max(500).optional(),
});

export const addMemberSchema = z.object({
  email: z
    .string({ required_error: 'Member email is required' })
    .email({ message: 'A valid email address is required' }),
  name: z
    .string({ required_error: 'Member name is required' })
    .min(2, { message: 'Member name must be at least 2 characters' }),
  role: z.enum(['owner', 'admin', 'member']).default('member'),
});
