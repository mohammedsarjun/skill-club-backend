import { IDispute } from '../../models/interfaces/dispute.model.interface';
import { AdminDisputeListItemDTO } from '../../dto/adminDTO/admin-dispute.dto';

export function mapDisputeToAdminListItemDTO(dispute: IDispute): AdminDisputeListItemDTO {
  const contractData = dispute.contractId as unknown as {
    title?: string;
    clientId?: { firstName?: string; lastName?: string };
    freelancerId?: { firstName?: string; lastName?: string };
  };

  let raisedByName = 'System';
  if (dispute.raisedBy === 'client') {
    const client = contractData.clientId;
    raisedByName = client
      ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client'
      : 'Client';
  } else if (dispute.raisedBy === 'freelancer') {
    const freelancer = contractData.freelancerId;
    raisedByName = freelancer
      ? `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim() || 'Freelancer'
      : 'Freelancer';
  }

  return {
    id: dispute._id?.toString() || '',
    disputeId: dispute.disputeId,
    contractTitle: contractData.title || 'N/A',
    raisedBy: {
      name: raisedByName,
      role: dispute.raisedBy,
    },
    reasonCode: dispute.reasonCode,
    status: dispute.status,
    createdAt: dispute.createdAt || new Date(),
  };
}
