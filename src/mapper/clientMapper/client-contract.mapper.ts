import { IContract, ContractDeliverable } from '../../models/interfaces/contract.model.interface';
import { ClientDeliverableMapper } from './client-deliverable.mapper';
import {
  ClientContractDetailDTO,
  EndHourlyContractResponseDTO,
} from '../../dto/clientDTO/client-contract.dto';
import { IDispute } from '../../models/interfaces/dispute.model.interface';

function docIdToString(id: unknown): string | undefined {
  if (!id) return undefined;
  if (typeof id === 'string') return id;
  if (
    typeof id === 'object' &&
    id !== null &&
    'toString' in id &&
    typeof (id as { toString: unknown }).toString === 'function'
  ) {
    return (id as { toString(): string }).toString();
  }
  return undefined;
}

export const mapContractModelToClientContractDetailDTO = (
  contract: IContract,
  financialSummary: {
    totalFunded: number;
    totalPaidToFreelancer: number;
    commissionPaid: number;
    totalHeld: number;
    totalRefund: number;
    availableContractBalance: number;
  },
  disputeDetail?: IDispute,
): ClientContractDetailDTO => {
  const rawObj = contract as unknown as Record<string, unknown>;

  const freelancerPopulated = rawObj.freelancerId as unknown as {
    _id?: unknown;
    firstName?: string;
    lastName?: string;
    logo?: string;
    country?: string;
    rating?: number;
  };
  const jobPopulated = rawObj.jobId as unknown as { _id?: unknown; title?: string };
  const offerPopulated = rawObj.offerId as unknown as {
    _id?: unknown;
    offerType?: 'direct' | 'proposal';
  };

  return {
    contractId: contract.contractId,
    offerId: docIdToString(contract.offerId) || '',
    offerType: offerPopulated?.offerType,
    jobId: contract.jobId ? docIdToString(contract.jobId) : undefined,
    jobTitle: jobPopulated?.title,
    proposalId: contract.proposalId ? docIdToString(contract.proposalId) : undefined,

    freelancer: freelancerPopulated
      ? {
          freelancerId: docIdToString(freelancerPopulated._id) || '',
          firstName: freelancerPopulated.firstName,
          lastName: freelancerPopulated.lastName,
          logo: freelancerPopulated.logo,
          country: freelancerPopulated.country,
          rating: freelancerPopulated.rating,
        }
      : undefined,

    paymentType: contract.paymentType,
    budget: contract.budget,
    hourlyRate: contract.hourlyRate,
    estimatedHoursPerWeek: contract.estimatedHoursPerWeek,

    milestones: contract.milestones?.map((m) => ({
      milestoneId: docIdToString(m._id) || '',
      title: m.title,
      amount: m.amount,
      expectedDelivery: m.expectedDelivery,
      status: m.status,
      submittedAt: m.submittedAt,
      approvedAt: m.approvedAt,
      revisionsAllowed: m.revisionsAllowed,
      disputeEligible: m.disputeEligible || false,
      disputeWindowEndsAt: m.disputeWindowEndsAt,
      isFunded: m.isFunded,
      deliverables: (m.deliverables || []).map((d, index) => ({
        id: docIdToString(d._id) || `deliverable-${index}`,
        submittedBy: docIdToString(d.submittedBy) || '',
        files: d.files || [],
        message: d.message,
        status: d.status,
        version: d.version || 1,
        submittedAt: d.submittedAt,
        approvedAt: d.approvedAt,
        revisionsRequested: d.revisionsRequested || 0,
        revisionsAllowed: m.revisionsAllowed,
        revisionsLeft: (m.revisionsAllowed || 0) - (d.revisionsRequested || 0),
      })),
      extensionRequest: m.extensionRequest
        ? {
            requestedBy: m.extensionRequest.requestedBy?.toString(),
            requestedDeadline: m.extensionRequest.requestedDeadline,
            reason: m.extensionRequest.reason,
            status: m.extensionRequest.status,
            requestedAt: m.extensionRequest.requestedAt,
            respondedAt: m.extensionRequest.respondedAt,
            responseMessage: m.extensionRequest.responseMessage,
          }
        : undefined,
    })),

    deliverables: contract.deliverables?.map((d: ContractDeliverable) => {
      const submittedByRaw = (d as unknown as Record<string, unknown>).submittedBy;

      let submittedBy: {
        id: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
      } | null = null;

      if (submittedByRaw) {
        if (typeof submittedByRaw === 'string') {
          submittedBy = { id: submittedByRaw };
        } else if (typeof submittedByRaw === 'object' && submittedByRaw !== null) {
          const obj = submittedByRaw as Record<string, unknown>;
          const idStr = docIdToString(obj._id) || docIdToString(obj.id) || '';
          submittedBy = {
            id: idStr,
            firstName: (obj.firstName as string) || undefined,
            lastName: (obj.lastName as string) || undefined,
            avatar: (obj.avatar as string) || undefined,
          };
        }
      }

      const dto = ClientDeliverableMapper.toDeliverableResponseDTO(d, contract as IContract);
      return {
        deliverableId: dto.id,
        submittedBy: submittedBy,
        files: dto.files,
        message: dto.message,
        status: dto.status,
        version: dto.version,
        submittedAt: new Date(dto.submittedAt),
        approvedAt: dto.approvedAt ? new Date(dto.approvedAt) : undefined,
        revisionsRequested: dto.revisionsRequested,
        revisionsAllowed: dto.revisionsAllowed,
        revisionsLeft: dto.revisionsLeft,
      };
    }),

    title: contract.title,
    description: contract.description,
    expectedStartDate: contract.expectedStartDate,
    expectedEndDate: contract.expectedEndDate,
    referenceFiles: contract.referenceFiles || [],
    referenceLinks: contract.referenceLinks || [],

    extensionRequest: contract.extensionRequest
      ? {
          requestedBy: contract.extensionRequest.requestedBy.toString(),
          requestedDeadline: contract.extensionRequest.requestedDeadline.toISOString(),
          reason: contract.extensionRequest.reason,
          status: contract.extensionRequest.status,
          requestedAt: contract.extensionRequest.requestedAt.toISOString(),
          respondedAt: contract.extensionRequest.respondedAt?.toISOString(),
          responseMessage: contract.extensionRequest.responseMessage,
        }
      : undefined,

    reporting: contract.reporting
      ? {
          frequency: contract.reporting.frequency,
          dueTimeUtc: contract.reporting.dueTimeUtc,
          dueDayOfWeek: contract.reporting.dueDayOfWeek,
          dueDayOfMonth: contract.reporting.dueDayOfMonth,
          format: contract.reporting.format,
        }
      : undefined,

    disputeDetail: {
      raisedBy: disputeDetail?.raisedBy,
      scope: disputeDetail?.scope,
      reasonCode: disputeDetail?.reasonCode,
      description: disputeDetail?.description,
      status: disputeDetail?.status,
      resolution: disputeDetail?.resolution,
    },

    status: contract.status,
    totalFunded: financialSummary.totalFunded,
    totalPaidToFreelancer: financialSummary.totalPaidToFreelancer,
    totalCommissionPaid: financialSummary.commissionPaid,
    totalAmountHeld: financialSummary.totalHeld,
    totalRefund: financialSummary.totalRefund,
    availableContractBalance: financialSummary.availableContractBalance,
    isFunded: contract.isFunded,
    cancelledBy: contract.cancelledBy,
    hasActiveCancellationDisputeWindow: hasActiveCancellationDisputeWindow(contract),
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
  };
};

const hasActiveCancellationDisputeWindow = (contract: IContract): boolean => {
  //fixed
  let isContractCancelled = contract.status === 'cancelled';
  if (!isContractCancelled) {
    return false;
  }
  let isContractFunded = contract.isFunded;
  if (!isContractFunded) {
    return false;
  }

  let hasAnyDeliverablesSubmitted = contract.deliverables && contract.deliverables.length > 0;
  if (!hasAnyDeliverablesSubmitted) {
    return false;
  }
  let isWithinDisputeWindow = contract.cancelledAt
    ? (new Date().getTime() - contract.cancelledAt.getTime()) / (1000 * 60 * 60 * 24) <= 5
    : false;
  if (!isWithinDisputeWindow) {
    return false;
  }
  return true;
};

export const mapToEndHourlyContractResponseDTO = (): EndHourlyContractResponseDTO => {
  return {
    ended: true,
    message: 'Contract ended successfully',
  };
};
