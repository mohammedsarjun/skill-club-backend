export interface RespondToContractExtensionDTO {
  approved: boolean;
  responseMessage?: string;
}

export interface ContractExtensionResponseDTO {
  requestedBy: string;
  requestedDeadline: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
  responseMessage?: string;
}
