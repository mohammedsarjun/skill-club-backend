import { z } from 'zod';

export const updateExpertiseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  specialities: z
    .array(z.string().min(1))
    .min(1, 'At least 1 speciality is required')
    .max(3, 'Maximum 3 specialities allowed')
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Duplicate specialities are not allowed',
    }),
  skills: z
    .array(z.string().min(1))
    .min(1, 'At least 1 skill is required')
    .max(15, 'Maximum 15 skills allowed')
    .refine((arr) => new Set(arr).size === arr.length, {
      message: 'Duplicate skills are not allowed',
    }),
});

export interface UpdateExpertiseDTO {
  category: string;
  specialities: string[];
  skills: string[];
}

export interface ExpertiseResponseDTO {
  workCategory: string;
  specialties: string[];
  skills: string[];
}
