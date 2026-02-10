import { z } from 'zod';

const milestoneSchema = z.object({
  title: z.string().min(3),
  amount: z.number().positive(),
  expected_delivery: z.string().refine((v) => !isNaN(new Date(v).getTime())),
  revisions: z.number().int().min(0).optional(),
});

export const offerValidationSchema = z
  .object({
    freelancerId: z.string().min(1),
    proposalId: z.string().optional(),
    jobId: z.string().optional(),
    // make offerType optional on payloads: when missing, server will infer from presence of proposalId
    offerType: z.enum(['direct', 'proposal']).optional(),
    title: z.string().min(5),
    description: z.string().min(20),
    payment_type: z.enum(['fixed', 'fixed_with_milestones', 'hourly']),
    budget: z.number().positive().optional(),
    hourly_rate: z.number().positive().optional(),
    estimated_hours_per_week: z.number().int().positive().optional(),
    milestones: z.array(milestoneSchema).optional(),
    expected_end_date: z.string().optional(),
    categoryId: z.string().min(1, 'Category is required'),
    reporting: z.object({
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      due_time_utc: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      due_day_of_week: z
        .enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .optional(),
      due_day_of_month: z.number().int().min(1).max(31).optional(),
      format: z.enum(['text_with_attachments', 'text_only', 'video']),
    }),
    reference_files: z
      .array(z.object({ file_name: z.string().min(1), file_url: z.string().url() }))
      .max(10),
    reference_links: z
      .array(z.object({ description: z.string().min(3), link: z.string().url() }))
      .max(10),
    expires_at: z.string().refine((v) => !isNaN(new Date(v).getTime())),
    status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']),
    // Number of allowed revisions for the whole offer
    revisions: z.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.payment_type !== 'hourly' && !data.budget) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['budget'], message: 'Budget required' });
    }
    if (data.payment_type === 'hourly' && !data.hourly_rate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['hourly_rate'],
        message: 'Hourly rate required',
      });
    }
    if (data.payment_type !== 'fixed_with_milestones' && !data.expected_end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expected_end_date'],
        message: 'Expected end date required for non-milestone contracts',
      });
    }
    if (data.expected_end_date && isNaN(new Date(data.expected_end_date).getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expected_end_date'],
        message: 'Invalid expected end date',
      });
    }
    if (
      data.payment_type === 'fixed_with_milestones' &&
      (!data.milestones || data.milestones.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['milestones'],
        message: 'At least one milestone required',
      });
    }

    if (data.reporting.frequency === 'weekly' && !data.reporting.due_day_of_week) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reporting.due_day_of_week'],
        message: 'Due day of week required for weekly reporting',
      });
    }
    if (data.reporting.frequency === 'monthly' && !data.reporting.due_day_of_month) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reporting.due_day_of_month'],
        message: 'Due day of month required for monthly reporting',
      });
    }
  });

export type OfferValidationSchemaType = z.infer<typeof offerValidationSchema>;
