import { IContract } from '../../models/interfaces/contract.model.interface';
import { FreelancerContractDetailDTO } from '../../dto/freelancerDTO/freelancer-contract.dto';
import { IDispute } from 'src/models/interfaces/dispute.model.interface';

export function mapContractToFreelancerDetailDTO(
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
): FreelancerContractDetailDTO {
  return {
    contractId: contract.contractId,
    offerId: contract.offerId?.toString() || '',
    offerType: (contract.offerId as unknown as { offerType?: 'direct' | 'proposal' })?.offerType,
    jobId: contract.jobId?.toString(),
    jobTitle: (contract.jobId as unknown as { title?: string })?.title,
    proposalId: contract.proposalId?.toString(),

    client: contract.clientId
      ? {
          clientId: (contract.clientId as unknown as { _id: string })._id || '',
          firstName: (contract.clientId as unknown as { firstName?: string }).firstName,
          lastName: (contract.clientId as unknown as { lastName?: string }).lastName,
          companyName: (contract.clientId as unknown as { companyName?: string }).companyName,
          logo: (contract.clientId as unknown as { logo?: string }).logo,
          country: (contract.clientId as unknown as { country?: string }).country,
        }
      : undefined,

    paymentType: contract.paymentType,
    budget: contract.budget,
    hourlyRate: contract.hourlyRate,
    estimatedHoursPerWeek: contract.estimatedHoursPerWeek,

    milestones: contract.milestones?.map((milestone) => ({
      milestoneId: (milestone._id as unknown as { toString(): string })?.toString?.() || '',
      title: milestone.title,
      amount: milestone.amount,
      expectedDelivery: milestone.expectedDelivery,
      status: milestone.status,
      submittedAt: milestone.submittedAt,
      approvedAt: milestone.approvedAt,
      disputeEligible: milestone.disputeEligible || false,
      disputeWindowEndsAt: milestone.disputeWindowEndsAt,
      revisionsAllowed: milestone.revisionsAllowed,
      isFunded: milestone.isFunded,
      deliverables:
        milestone.deliverables?.map((deliverable, index) => ({
          id:
            (deliverable._id as unknown as { toString(): string })?.toString?.() ||
            `deliverable-${index}`,
          submittedBy: deliverable.submittedBy?.toString() || '',
          files: deliverable.files || [],
          message: deliverable.message,
          status: deliverable.status,
          version: deliverable.version || 1,
          submittedAt: deliverable.submittedAt,
          approvedAt: deliverable.approvedAt,
          revisionsRequested: deliverable.revisionsRequested || 0,
          revisionsAllowed: milestone.revisionsAllowed,
          revisionsLeft: (milestone.revisionsAllowed || 0) - (deliverable.revisionsRequested || 0),
        })) || [],
      extensionRequest: milestone.extensionRequest
        ? {
            requestedBy: milestone.extensionRequest.requestedBy?.toString(),
            requestedDeadline: milestone.extensionRequest.requestedDeadline,
            reason: milestone.extensionRequest.reason,
            status: milestone.extensionRequest.status,
            requestedAt: milestone.extensionRequest.requestedAt,
            respondedAt: milestone.extensionRequest.respondedAt,
            responseMessage: milestone.extensionRequest.responseMessage,
          }
        : undefined,
    })),

    timesheets: contract.timesheets?.map((timesheet) => ({
      weekStart: timesheet.weekStart,
      weekEnd: timesheet.weekEnd,
      totalHours: timesheet.totalHours,
      totalAmount: timesheet.totalAmount,
      status: timesheet.status,
    })),

    deliverables: contract.deliverables?.map((deliverable) => ({
      id: (deliverable._id as unknown as { toString(): string })?.toString?.() || '',
      submittedBy: deliverable.submittedBy?.toString() || '',
      files: deliverable.files,
      message: deliverable.message,
      status: deliverable.status,
      submittedAt: deliverable.submittedAt,
      approvedAt: deliverable.approvedAt,
      revisionsRequested: deliverable.revisionsRequested,
      revisionsAllowed: typeof contract.revisions === 'number' ? contract.revisions : undefined,
      revisionsLeft:
        (typeof contract.revisions === 'number' ? contract.revisions : 0) -
        (deliverable.revisionsRequested || 0),
    })),

    title: contract.title,
    description: contract.description,
    expectedStartDate: contract.expectedStartDate,
    expectedEndDate: contract.expectedEndDate,
    referenceFiles: contract.referenceFiles,
    referenceLinks: contract.referenceLinks,

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
    cancelledBy: contract.cancelledBy,
    hasActiveCancellationDisputeWindow: hasActiveCancellationDisputeWindow(contract),
    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
  };
}

function hasActiveCancellationDisputeWindow(contract: IContract): boolean {
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
}
