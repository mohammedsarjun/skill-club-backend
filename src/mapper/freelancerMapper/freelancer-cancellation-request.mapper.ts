import { ICancellationRequest } from '../../models/interfaces/cancellation-request.model.interface';
import { FreelancerCancellationRequestDTO } from '../../dto/freelancerDTO/freelancer-cancellation-request.dto';

export function mapCancellationRequestToFreelancerDTO(
  cancellationRequest: ICancellationRequest,
): FreelancerCancellationRequestDTO {
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
    respondedAt: cancellationRequest.respondedAt?.toISOString(),
    responseMessage: cancellationRequest.responseMessage,
    createdAt: cancellationRequest.createdAt?.toISOString() || new Date().toISOString(),
  };
}
