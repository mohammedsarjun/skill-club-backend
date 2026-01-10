import { z } from 'zod';

export const activateHourlyContractDTOSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
});

export type ActivateHourlyContractDTO = z.infer<typeof activateHourlyContractDTOSchema>;
