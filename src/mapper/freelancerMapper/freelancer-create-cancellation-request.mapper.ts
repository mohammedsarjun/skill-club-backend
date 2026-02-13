import { ICancellationRequest } from '../../models/interfaces/cancellation-request.model.interface';
import { FreelancerCancellationRequestResponseDTO } from '../../dto/freelancerDTO/freelancer-create-cancellation-request.dto';

export function toFreelancerCancellationRequestResponseDTO(
  cancellationRequest: ICancellationRequest,
): FreelancerCancellationRequestResponseDTO {
  return {
    cancellationRequestId: cancellationRequest.cancellationRequestId,
    contractId: cancellationRequest.contractId.toString(),
    initiatedBy: cancellationRequest.initiatedBy,
    reason: cancellationRequest.reason,
    clientSplitPercentage: cancellationRequest.clientSplitPercentage,
    freelancerSplitPercentage: cancellationRequest.freelancerSplitPercentage,
    totalHeldAmount: cancellationRequest.totalHeldAmount,
    clientAmount: cancellationRequest.clientAmount,
    freelancerAmount: cancellationRequest.freelancerAmount,
    status: cancellationRequest.status,
    createdAt: cancellationRequest.createdAt?.toISOString() || new Date().toISOString(),
  };
}
