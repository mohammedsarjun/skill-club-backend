import { z } from 'zod';

export const categoryValidationSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(50, { message: 'Name must be at most 50 characters long' }),

  description: z
    .string()
    .max(200, { message: 'Description must be at most 200 characters long' })
    .optional(),

  status: z.enum(['list', 'unlist']),
});

export type CategoryDTO = z.infer<typeof categoryValidationSchema>;
