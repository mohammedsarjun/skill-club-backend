import {
  MilestoneDeliverable,
  ContractMilestone,
  MilestoneExtensionRequest,
} from '../../models/interfaces/contract.model.interface';
import {
  ClientMilestonesDetailDTO,
  MilestoneDeliverableResponseDTO,
  MilestoneExtensionResponseDTO,
} from '../../dto/clientDTO/client-milestone.dto';

export class ClientMilestoneMapper {
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

  static toClientMilestoneDetailDTO(milestone: ContractMilestone): ClientMilestonesDetailDTO {
    return {
      id: milestone._id?.toString() || '',
      title: milestone.title,
      amount: milestone.amount,
      amountBaseUSD: milestone.amountBaseUSD,
      expectedDelivery: milestone.expectedDelivery?.toISOString
        ? milestone.expectedDelivery.toISOString()
        : String(milestone.expectedDelivery),
      status: milestone.status,
      submittedAt: milestone.submittedAt?.toISOString?.(),
      approvedAt: milestone.approvedAt?.toISOString?.(),
      revisionsAllowed: milestone.revisionsAllowed,
      deliverables: milestone.deliverables?.map((d) =>
        ClientMilestoneMapper.toMilestoneDeliverableResponseDTO(d, milestone),
      ),
      extensionRequest: milestone.extensionRequest
        ? ClientMilestoneMapper.toMilestoneExtensionResponseDTO(milestone.extensionRequest)
        : undefined,
    };
  }
}
