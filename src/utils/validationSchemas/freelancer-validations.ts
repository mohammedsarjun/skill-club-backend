import z from 'zod';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const years = Array.from({ length: 50 }, (_, i) => (1980 + i).toString());

export const workExperienceSchema = z
  .object({
    title: z
      .string()
      .nonempty('Title is required')
      .min(2, 'Title must be at least 2 characters long'),

    company: z
      .string()
      .nonempty('Company Name is required')
      .min(2, 'Company Name must be at least 2 characters long'),

    location: z
      .string()
      .nonempty('Location is required')
      .min(2, 'Location must be at least 2 characters long'),

    country: z
      .string()
      .nonempty('Country is required')
      .min(2, 'Country must be at least 2 characters long'),

    isCurrentRole: z.boolean().default(false),

    startMonth: z.enum(months as [string, ...string[]], {
      message: 'Select a valid start month',
    }),

    startYear: z.enum(years as [string, ...string[]], {
      message: 'Select a valid start year',
    }),

    endMonth: z
      .enum(months as [string, ...string[]], {
        message: 'Select a valid end month',
      })
      .optional(),

    endYear: z
      .enum(years as [string, ...string[]], {
        message: 'Select a valid end year',
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.isCurrentRole && (!data.endMonth || !data.endYear)) {
        return false;
      }
      return true;
    },
    {
      message: 'End month and year are required if not currently working in this role',
      path: ['endMonth'],
    },
  );
