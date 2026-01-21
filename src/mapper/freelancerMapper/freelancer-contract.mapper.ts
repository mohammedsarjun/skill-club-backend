import { IContract } from '../../models/interfaces/contract.model.interface';
import { FreelancerContractDetailDTO } from '../../dto/freelancerDTO/freelancer-contract.dto';

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
      revisionsAllowed: (milestone as any).revisionsAllowed,
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
          revisionsRequested: (deliverable as any).revisionsRequested || 0,
          revisionsAllowed: (milestone as any).revisionsAllowed,
          revisionsLeft:
            ((milestone as any).revisionsAllowed || 0) -
            ((deliverable as any).revisionsRequested || 0),
        })) || [],
      extensionRequest: (milestone as any).extensionRequest
        ? {
            requestedBy: (milestone as any).extensionRequest.requestedBy?.toString(),
            requestedDeadline: (milestone as any).extensionRequest.requestedDeadline,
            reason: (milestone as any).extensionRequest.reason,
            status: (milestone as any).extensionRequest.status,
            requestedAt: (milestone as any).extensionRequest.requestedAt,
            respondedAt: (milestone as any).extensionRequest.respondedAt,
            responseMessage: (milestone as any).extensionRequest.responseMessage,
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
      revisionsRequested: (deliverable as any).revisionsRequested,
      revisionsAllowed:
        typeof (contract as any).revisions === 'number' ? (contract as any).revisions : undefined,
      revisionsLeft:
        (typeof (contract as any).revisions === 'number' ? (contract as any).revisions : 0) -
        ((deliverable as any).revisionsRequested || 0),
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

    communication: contract.communication
      ? {
          preferredMethod: contract.communication.preferredMethod,
          meetingFrequency: contract.communication.meetingFrequency,
          meetingDayOfWeek: contract.communication.meetingDayOfWeek,
          meetingDayOfMonth: contract.communication.meetingDayOfMonth,
          meetingTimeUtc: contract.communication.meetingTimeUtc,
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
