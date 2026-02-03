import { IDispute } from '../../models/interfaces/dispute.model.interface';
import { IContract } from '../../models/interfaces/contract.model.interface';
import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';
import { AdminDisputeListItemDTO, AdminDisputeDetailDTO } from '../../dto/adminDTO/admin-dispute.dto';
import { IWorklog } from 'src/models/interfaces/worklog.model.interface';

export function mapDisputeToAdminListItemDTO(dispute: IDispute): AdminDisputeListItemDTO {
    console.log(dispute)
  const contractData = (dispute.contractId || {}) as unknown as {
    title?: string | null;
    clientId?: { firstName?: string; lastName?: string } | null;
    freelancerId?: { firstName?: string; lastName?: string } | null;
  };



  let raisedByName = 'System';
  if (dispute.raisedBy === 'client') {
    const client = contractData?.clientId as { firstName?: string; lastName?: string } | null | undefined;
    raisedByName = client
      ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client'
      : 'Client';
  } else if (dispute.raisedBy === 'freelancer') {
    const freelancer = contractData?.freelancerId as { firstName?: string; lastName?: string } | null | undefined;
    raisedByName = freelancer
      ? `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim() || 'Freelancer'
      : 'Freelancer';
  }

  return {
    id: dispute._id?.toString() || '',
    disputeId: dispute.disputeId,
    contractTitle: contractData?.title || 'N/A',
    raisedBy: {
      name: raisedByName,
      role: dispute.raisedBy,
    },
    reasonCode: dispute.reasonCode,
    status: dispute.status,
    createdAt: dispute.createdAt || new Date(),
  };
}

export function mapDisputeToAdminDetailDTO(
  dispute: IDispute,
  contract: IContract,
  holdTransaction?: IContractTransaction | null,
  workLogDetail?:IWorklog|null
): AdminDisputeDetailDTO {
  const client = contract.clientId as unknown as {
    _id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  };

  const freelancer = contract?.freelancerId as unknown as {
    _id: string;
    firstName: string;
    lastName: string;
  };

  const milestones = contract.paymentType === 'fixed_with_milestones' && contract.milestones
    ? contract.milestones.map((m) => ({
        id: m._id?.toString() || '',
        milestoneId: m._id?.toString() || '',
        title: m.title,
        amount: m.amount,
        expectedDelivery: m.expectedDelivery.toISOString(),
        status: m.status,
        submittedAt: m.submittedAt?.toISOString(),
        approvedAt: m.approvedAt?.toISOString(),
        deliverables: m.deliverables?.map((d) => ({
          id: d._id?.toString() || '',
          submittedBy: d.submittedBy.toString(),
          files: d.files,
          message: d.message,
          status: d.status,
          version: d.version,
          submittedAt: d.submittedAt.toISOString(),
          approvedAt: d.approvedAt?.toISOString(),
        })),
      }))
    : undefined;

  const deliverables = contract.paymentType === 'fixed' && contract.deliverables
    ? contract.deliverables.map((d) => ({
        id: d._id?.toString() || '',
        submittedBy: d.submittedBy.toString(),
        files: d.files,
        message: d.message,
        status: d.status,
        version: d.version,
        submittedAt: d.submittedAt.toISOString(),
        approvedAt: d.approvedAt?.toISOString(),
      }))
    : undefined;

    const workLog:Partial<IWorklog>|undefined=contract.paymentType=='hourly'&& workLogDetail?{
      worklogId:workLogDetail.worklogId,
      contractId:workLogDetail.contractId,
      milestoneId:workLogDetail.milestoneId,
      freelancerId:workLogDetail?.freelancerId,
      startTime:workLogDetail.startTime,
      endTime:workLogDetail.endTime,
      duration:workLogDetail.duration,
      files:workLogDetail.files,
      description:workLogDetail.description,
      status:workLogDetail.status,
      reviewedAt:workLogDetail.reviewedAt,
      disputeWindowEndDate:workLogDetail.disputeWindowEndDate,
      reviewMessage:workLogDetail.reviewMessage,
    }
    :undefined;

  

    

  return {
    disputeId: dispute.disputeId,
    contractId: contract._id?.toString() || '',
    raisedBy: dispute.raisedBy,
    scope: dispute.scope,
    scopeId: dispute.scopeId?.toString() || null,
    contractType: dispute.contractType,
    reasonCode: dispute.reasonCode,
    description: dispute.description,
    status: dispute.status,
    createdAt: dispute.createdAt?.toISOString() || '',
    updatedAt: dispute.updatedAt?.toISOString() || '',
    contract: {
      contractId: contract.contractId,
      title: contract.title,
      description: contract.description,
      paymentType: contract.paymentType,
      budget: contract.budget,
      hourlyRate: contract.hourlyRate,
      status: contract.status,
      expectedStartDate: contract.expectedStartDate.toISOString(),
      expectedEndDate: contract.expectedEndDate.toISOString(),
      fundedAmount: contract.fundedAmount,
      totalPaid: contract.totalPaid,
      balance: contract.balance,
      client: {
        clientId: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        companyName: client.companyName,
      },
      freelancer: {
        freelancerId: freelancer._id,
        firstName: freelancer.firstName,
        lastName: freelancer.lastName,
      },
    },
    holdTransaction: holdTransaction
      ? {
          transactionId: holdTransaction.transactionId,
          amount: holdTransaction.amount,
          description: holdTransaction.description,
          createdAt: holdTransaction.createdAt?.toISOString() || '',
        }
      : undefined,
    milestones,
    deliverables,
    workLog
  };
}
