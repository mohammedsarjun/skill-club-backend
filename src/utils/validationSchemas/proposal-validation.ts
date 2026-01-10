import { z } from 'zod';

// Helper to convert string to number
export function stringToNumber(val: unknown, _fieldName: string) {
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      return undefined;
    }
    return parsed;
  }
  return val;
}

// Hourly job proposal schema
export const hourlyProposalSchema = z.object({
  hourlyRate: z.preprocess(
    (val) => stringToNumber(val, 'hourlyRate'),
    z.number().min(5, 'Hourly rate must be at least $5'),
  ),
  availableHoursPerWeek: z.preprocess(
    (val) => stringToNumber(val, 'availableHoursPerWeek'),
    z.number().min(1, 'Available hours required'),
  ),
  coverLetter: z.string().min(10, 'Minimum 10 characters required'),
});

// Fixed price job proposal schema
export const fixedProposalSchema = z.object({
  proposedBudget: z.preprocess(
    (val) => stringToNumber(val, 'proposedBudget'),
    z.number().min(1, 'Proposed budget required'),
  ),
  deadline: z.string().nonempty('Deadline is required'),
  coverLetter: z.string().min(10, 'Minimum 10 characters required'),
});
