import { IContract } from '../../models/interfaces/contract.model.interface';
import {
  AdminContractListItemDTO,
  AdminContractDetailDTO,
} from '../../dto/adminDTO/admin-contract.dto';

export function mapContractToAdminListItemDTO(contract: IContract): AdminContractListItemDTO {
  return {
    id: contract._id?.toString() || '',
    contractId: contract.contractId,
    title: contract.title,
    paymentType: contract.paymentType,
    budget: contract.budget,
    hourlyRate: contract.hourlyRate,
    status: contract.status,
    createdAt: contract.createdAt || new Date(),
    client: contract.clientId
      ? {
          clientId:
            (
              contract.clientId as unknown as {
                _id: string;
                firstName?: string;
                lastName?: string;
                companyName?: string;
                logo?: string;
              }
            )._id || '',
          firstName: (contract.clientId as unknown as { firstName?: string }).firstName,
          lastName: (contract.clientId as unknown as { lastName?: string }).lastName,
          companyName: (contract.clientId as unknown as { companyName?: string }).companyName,
          logo: (contract.clientId as unknown as { logo?: string }).logo,
        }
      : undefined,
    freelancer: contract.freelancerId
      ? {
          freelancerId:
            (
              contract.freelancerId as unknown as {
                _id: string;
                firstName?: string;
                lastName?: string;
                logo?: string;
              }
            )._id || '',
          firstName: (contract.freelancerId as unknown as { firstName?: string }).firstName,
          lastName: (contract.freelancerId as unknown as { lastName?: string }).lastName,
          logo: (contract.freelancerId as unknown as { freelancerProfile?: { logo?: string } })
            .freelancerProfile?.logo,
        }
      : undefined,
  };
}

export function mapContractToAdminDetailDTO(contract: IContract): AdminContractDetailDTO {
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

    freelancer: contract.freelancerId
      ? {
          freelancerId: (contract.freelancerId as unknown as { _id: string })._id || '',
          firstName: (contract.freelancerId as unknown as { firstName?: string }).firstName,
          lastName: (contract.freelancerId as unknown as { lastName?: string }).lastName,
          logo: (contract.freelancerId as unknown as { logo?: string }).logo,
          country: (contract.freelancerId as unknown as { country?: string }).country,
          rating: (contract.freelancerId as unknown as { rating?: number }).rating,
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
    })),

    timesheets: contract.timesheets?.map((timesheet) => ({
      weekStart: timesheet.weekStart,
      weekEnd: timesheet.weekEnd,
      totalHours: timesheet.totalHours,
      totalAmount: timesheet.totalAmount,
      status: timesheet.status,
    })),

    deliverables: contract.deliverables?.map((deliverable) => ({
      submittedBy: deliverable.submittedBy?.toString() || '',
      files: deliverable.files,
      message: deliverable.message,
      status: deliverable.status,
      submittedAt: deliverable.submittedAt,
      approvedAt: deliverable.approvedAt,
    })),

    title: contract.title,
    description: contract.description,
    expectedStartDate: contract.expectedStartDate,
    expectedEndDate: contract.expectedEndDate,
    referenceFiles: contract.referenceFiles,
    referenceLinks: contract.referenceLinks,

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
    fundedAmount: contract.fundedAmount,
    totalPaid: contract.totalPaid,
    balance: contract.balance,

    createdAt: contract.createdAt,
    updatedAt: contract.updatedAt,
  };
}
