import {
  ClientProposalResponseDTO,
  ProposalQueryParamsDTO,
} from '../../dto/clientDTO/client-proposal.dto';
import { ProposalDetailWithFreelancerDetail } from '../../models/interfaces/proposal.model.interface';

type ProposalStatus = 'pending_verification' | 'offer_sent' | 'rejected';

type RawFilters = {
  status?: string;
};

export const mapRawQueryFiltersToProposalQueryParamsDTO = (
  rawQuery: Record<string, unknown>,
): ProposalQueryParamsDTO => {
  let parsedFilters: RawFilters | undefined;

  if (typeof rawQuery?.filters === 'string') {
    try {
      const parsed = JSON.parse(rawQuery.filters as string);
      if (typeof parsed === 'object' && parsed !== null) {
        parsedFilters = parsed as RawFilters;
      }
    } catch {
      parsedFilters = undefined;
    }
  } else if (typeof rawQuery?.filters === 'object' && rawQuery?.filters !== null) {
    parsedFilters = rawQuery.filters as RawFilters;
  }

  const allowedStatuses: readonly ProposalStatus[] = [
    'pending_verification',
    'offer_sent',
    'rejected',
  ];

  const statusFromFrontend =
    parsedFilters?.status ?? (rawQuery?.status as string | undefined);
  const validStatus =
    typeof statusFromFrontend === 'string' &&
    allowedStatuses.includes(statusFromFrontend as ProposalStatus)
      ? (statusFromFrontend as ProposalStatus)
      : undefined;

  return {
    search: typeof rawQuery?.search === 'string' ? rawQuery.search : '',
    page: Number(rawQuery?.page) > 0 ? Number(rawQuery?.page) : 1,
    limit: Number(rawQuery?.limit) > 0 ? Number(rawQuery?.limit) : 10,
    filters: validStatus ? { status: validStatus } : {},
    status: validStatus,
  };
};

export const mapProposalModelToClientProposalResponseDTO = (
  rawProposalData: ProposalDetailWithFreelancerDetail,
): ClientProposalResponseDTO => {
  return {
    proposalId: rawProposalData?._id?.toString()!,
    freelancer: {
      freelancerId: rawProposalData.freelancer._id.toString(),
      firstName: rawProposalData.freelancer.firstName,
      lastName: rawProposalData.freelancer.lastName,
      avatar: rawProposalData.freelancer.freelancerProfile.logo,
      country: rawProposalData.freelancer.address.country,
    },
    proposedBudget: rawProposalData?.proposedBudget,
    deadline: rawProposalData?.deadline,
    hourlyRate: rawProposalData?.hourlyRate!,
    availableHoursPerWeek: rawProposalData?.availableHoursPerWeek!,
    coverLetter: rawProposalData?.coverLetter,
    status: rawProposalData?.status,
    proposedAt: rawProposalData?.createdAt!,
  };
};
