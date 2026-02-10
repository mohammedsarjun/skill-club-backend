import { ICancellationRequest } from '../../models/interfaces/cancellation-request.model.interface';
import { CancellationRequestResponseDTO } from '../../dto/clientDTO/client-cancellation-request.dto';

export const toCancellationRequestResponseDTO = (request: ICancellationRequest): CancellationRequestResponseDTO => {
  return {
    cancellationRequestId: request.cancellationRequestId,
    contractId: request.contractId.toString(),
    initiatedBy: request.initiatedBy,
    reason: request.reason,
    clientSplitPercentage: request.clientSplitPercentage,
    freelancerSplitPercentage: request.freelancerSplitPercentage,
    totalHeldAmount: request.totalHeldAmount,
    clientAmount: request.clientAmount,
    freelancerAmount: request.freelancerAmount,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
  };
};
