import { z } from 'zod';

const hourlyRateSchema = z
  .object({
    min: z.number().positive('Minimum hourly rate must be greater than 0'),
    max: z.number().positive('Maximum hourly rate must be greater than 0'),
    hoursPerWeek: z
      .number()
      .min(1, 'Hours per week must be at least 1')
      .max(60, 'Hours per week cannot exceed 60'),
    estimatedDuration: z.enum(['1 To 3 Months', '3 To 6 Months']),
  })
  .refine((data) => data.max >= data.min, {
    message: 'Maximum hourly rate must be greater than or equal to minimum rate',
    path: ['max'],
  });

const fixedRateSchema = z
  .object({
    min: z.number().positive('Minimum budget must be greater than 0'),
    max: z.number().positive('Maximum budget must be greater than 0'),
  })
  .refine((data) => data.max >= data.min, {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['max'],
  });

export const createJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, 'Title must be at least 5 characters long')
      .max(100, 'Title is too long')
      .refine((val) => val.trim().length > 0, {
        message: 'Title cannot be empty or just spaces',
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message: 'Title cannot contain multiple consecutive spaces',
      }),
    description: z
      .string()
      .min(50, 'Description must be at least 50 characters long')
      .max(50000, 'Description cannot exceed 50000 characters')
      .refine(
        (val) => val.replace(/<[^>]*>/g, '').trim().length >= 50,
        'Minimum 50 characters required',
      )
      .refine(
        (val) => !/ {2,}/.test(val.replace(/<[^>]*>/g, '')),
        'Description cannot contain excessive spaces',
      ),
    category: z.string(),
    specialities: z
      .array(z.string())
      .min(1, { message: 'Select at least one speciality.' })
      .max(3, { message: 'Select at most 3 specialities.' }),
    skills: z.array(z.string()).min(1, 'Select at least one skills.'),
    rateType: z.enum(['hourly', 'fixed']),
    hourlyRate: hourlyRateSchema.optional(),
    fixedRate: fixedRateSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rateType === 'hourly' && !data.hourlyRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'hourlyRate is required when rateType is hourly',
        path: ['hourlyRate'],
      });
    }

    if (data.rateType === 'fixed' && !data.fixedRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'fixedRate is required when rateType is fixed',
        path: ['fixedRate'],
      });
    }
  });

export const updateJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, 'Title must be at least 5 characters long')
      .max(100, 'Title is too long')
      .refine((val) => val.trim().length > 0, {
        message: 'Title cannot be empty or just spaces',
      })
      .refine((val) => !/\s{2,}/.test(val), {
        message: 'Title cannot contain multiple consecutive spaces',
      }),
    description: z
      .string()
      .min(50, 'Description must be at least 50 characters long')
      .max(50000, 'Description cannot exceed 50000 characters')
      .refine(
        (val) => val.replace(/<[^>]*>/g, '').trim().length >= 50,
        'Minimum 50 characters required',
      )
      .refine(
        (val) => !/ {2,}/.test(val.replace(/<[^>]*>/g, '')),
        'Description cannot contain excessive spaces',
      ),
    category: z.string(),
    specialities: z
      .array(z.string())
      .min(1, { message: 'Select at least one speciality.' })
      .max(3, { message: 'Select at most 3 specialities.' }),
    skills: z.array(z.string()).min(1, 'Select at least one skills.'),
    rateType: z.enum(['hourly', 'fixed']),
    hourlyRate: hourlyRateSchema.optional(),
    fixedRate: fixedRateSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rateType === 'hourly' && !data.hourlyRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'hourlyRate is required when rateType is hourly',
        path: ['hourlyRate'],
      });
    }

    if (data.rateType === 'fixed' && !data.fixedRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'fixedRate is required when rateType is fixed',
        path: ['fixedRate'],
      });
    }
  });
