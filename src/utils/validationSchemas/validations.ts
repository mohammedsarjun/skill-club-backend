import z from 'zod';

export const portfolioSchema = z.object({
  title: z.string().nonempty('Project title is required'),
  description: z.string().nonempty('Description is required'),
  role: z.string().nonempty('Role is required'),
  projectUrl: z.string().url('Invalid project URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  technologies: z.array(z.string()),
  images: z.array(z.unknown().optional()).optional(),
  video: z.unknown().optional(),
});

export const educationSchema = z.object({
  school: z.string().min(2, 'School is required'),
  degree: z.string().min(2, 'Degree is required'),
  field: z.string().min(2, 'Field is required'),
  startYear: z.string().min(4, 'Start year is required'),
  endYear: z.string().min(4, 'End year is required'),
});

export const userProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),

  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),

  dob: z
    .string()
    .refine((value) => !isNaN(Date.parse(value)), {
      message: 'Invalid date format',
    })
    .refine(
      (value) => {
        const date = new Date(value);
        const today = new Date();
        return date < today;
      },
      { message: 'Date of birth must be in the past' },
    ),
});
