import { IDispute } from '../../models/interfaces/dispute.model.interface';
import { DisputeResponseDTO } from '../../dto/freelancerDTO/freelancer-dispute.dto';

export const mapDisputeToResponseDTO = (dispute: IDispute): DisputeResponseDTO => {
  return {
    disputeId: dispute._id.toString(),
    contractId: dispute.contractId.toString(),
    contractType: dispute.contractType,
    raisedBy: dispute.raisedBy,
    scope: dispute.scope,
    scopeId: dispute.scopeId ? dispute.scopeId.toString() : null,
    reasonCode: dispute.reasonCode,
    description: dispute.description,
    status: dispute.status,
    resolution: dispute.resolution
      ? {
          outcome: dispute.resolution.outcome,
          clientAmount: dispute.resolution.clientAmount,
          freelancerAmount: dispute.resolution.freelancerAmount,
          decidedBy: dispute.resolution.decidedBy,
          decidedAt: dispute.resolution.decidedAt?.toISOString(),
        }
      : undefined,
    createdAt: dispute.createdAt.toISOString(),
    updatedAt: dispute.updatedAt.toISOString(),
  };
};
