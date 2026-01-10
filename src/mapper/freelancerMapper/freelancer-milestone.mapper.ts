import {
  MilestoneDeliverable,
  ContractMilestone,
  MilestoneExtensionRequest,
} from '../../models/interfaces/contract.model.interface';
import {
  MilestoneDeliverableResponseDTO,
  MilestoneExtensionResponseDTO,
} from '../../dto/freelancerDTO/freelancer-milestone.dto';

export class FreelancerMilestoneMapper {
  static toMilestoneDeliverableResponseDTO(
    deliverable: MilestoneDeliverable,
    milestone: ContractMilestone,
  ): MilestoneDeliverableResponseDTO {
    const revisionsRequested = deliverable.revisionsRequested || 0;
    const revisionsAllowed = milestone.revisionsAllowed || 0;

    return {
      id: deliverable._id?.toString() || '',
      submittedBy: deliverable.submittedBy.toString(),
      files: deliverable.files,
      message: deliverable.message,
      status: deliverable.status,
      version: deliverable.version,
      submittedAt: deliverable.submittedAt.toISOString(),
      approvedAt: deliverable.approvedAt?.toISOString(),
      revisionsRequested,
      revisionsAllowed,
      revisionsLeft: Math.max(0, revisionsAllowed - revisionsRequested),
    };
  }

  static toMilestoneExtensionResponseDTO(
    extension: MilestoneExtensionRequest,
  ): MilestoneExtensionResponseDTO {
    return {
      requestedBy: extension.requestedBy.toString(),
      requestedDeadline: extension.requestedDeadline.toISOString(),
      reason: extension.reason,
      status: extension.status,
      requestedAt: extension.requestedAt.toISOString(),
      respondedAt: extension.respondedAt?.toISOString(),
      responseMessage: extension.responseMessage,
    };
  }
}
