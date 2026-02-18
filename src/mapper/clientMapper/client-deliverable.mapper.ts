import { ContractDeliverable, IContract } from '../../models/interfaces/contract.model.interface';
import { DeliverableResponseDTO } from '../../dto/clientDTO/client-deliverable.dto';

export class ClientDeliverableMapper {
  static toDeliverableResponseDTO(
    deliverable: ContractDeliverable,
    contract?: IContract,
  ): DeliverableResponseDTO {
    const revisionsRequested = deliverable.revisionsRequested || 0;

    let revisionsAllowed = 0;
    if (contract) {
      if (contract.paymentType === 'fixed_with_milestones' && contract.milestones) {
        const idx = Math.max(0, (deliverable.version || 1) - 1);
        const milestone = contract.milestones[idx];
        if (milestone && typeof milestone.revisionsAllowed === 'number') {
          revisionsAllowed = milestone.revisionsAllowed;
        }
      }
      if (!revisionsAllowed && typeof contract.revisions === 'number') {
        revisionsAllowed = contract.revisions || 0;
      }
    }

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
}
