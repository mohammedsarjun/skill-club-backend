import { z } from 'zod';

export const skillSchema = z.object({
  name: z.string().nonempty('Name is required').min(3, 'Name must be at least 3 characters long'),

  specialties: z
    .array(z.string().nonempty('Specialty ID is required'))
    .min(1, 'Select at least one specialty'),

  status: z.enum(['list', 'unlist']).refine((val) => ['list', 'unlist'].includes(val), {
    message: 'Enter a proper value',
  }),
});
