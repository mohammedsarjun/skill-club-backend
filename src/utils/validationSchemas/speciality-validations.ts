import { z } from 'zod';

export const specialityValidationSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Speciality name must be at least 3 characters long' })
    .max(50, { message: 'Speciality name must be at most 50 characters long' }),

  category: z
    .string()
    .min(3, { message: 'Category name must be at least 3 characters long' })
    .max(50, { message: 'Category name must be at most 50 characters long' }),

  status: z.enum(['list', 'unlist']),
});
