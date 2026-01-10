import { IOffer } from '../../models/interfaces/offer.model.interface';
import {
  FreelancerOfferListItemDTO,
  FreelancerOfferDetailDTO,
} from '../../dto/freelancerDTO/freelancer-offer.dto';

export const mapOfferModelToFreelancerOfferListItemDTO = (
  offer: IOffer,
): FreelancerOfferListItemDTO => {
  const rawId = (offer as unknown as { _id?: { toString(): string } })._id?.toString() ?? '';
  const clientPop = offer.clientId as unknown as Partial<{
    firstName?: string;
    lastName?: string;
    clientProfile?: { logo?: string };
    toString?: () => string;
  }>;
  const client =
    typeof offer.clientId === 'object' && offer.clientId !== null
      ? {
          clientId: (clientPop as { toString?: () => string }).toString?.() || '',
          firstName: clientPop.firstName,
          lastName: clientPop.lastName,
          logo: clientPop.clientProfile?.logo,
        }
      : undefined;
  return {
    offerId: rawId,
    title: offer.title,
    description: offer.description,
    offerType: offer.offerType,
    paymentType: offer.paymentType,
    budget: offer.budget,
    hourlyRate: offer.hourlyRate,
    status: offer.status,
    createdAt: offer.createdAt!,
    expiresAt: offer.expiresAt,
    client,
  };
};

export const mapOfferModelToFreelancerOfferDetailDTO = (
  offer: IOffer,
): FreelancerOfferDetailDTO => {
  const base = mapOfferModelToFreelancerOfferListItemDTO(offer);
  const clientPop = offer.clientId as unknown as Partial<{
    firstName?: string;
    lastName?: string;
    clientProfile?: { logo?: string; companyName?: string };
    address?: { country?: string };
    toString?: () => string;
  }>;
  const jobPop = offer.jobId as unknown as Partial<{ title?: string; toString?: () => string }>;
  return {
    ...base,
    jobId: offer.jobId?.toString(),
    proposalId: offer.proposalId?.toString(),
    jobTitle: jobPop?.title,
    clientCountry: clientPop?.address?.country,
    clientCompanyName: clientPop?.clientProfile?.companyName,
    milestones: offer.milestones?.map((m) => ({
      title: m.title,
      amount: m.amount,
      expectedDelivery: m.expectedDelivery,
    })),
    expectedStartDate: offer.expectedStartDate,
    expectedEndDate: offer.expectedEndDate,
    communication: {
      preferredMethod: offer.communication.preferredMethod,
      meetingFrequency: offer.communication.meetingFrequency,
      meetingDayOfWeek: offer.communication.meetingDayOfWeek,
      meetingDayOfMonth: offer.communication.meetingDayOfMonth,
      meetingTimeUtc: offer.communication.meetingTimeUtc,
    },
    reporting: {
      frequency: offer.reporting.frequency,
      dueTimeUtc: offer.reporting.dueTimeUtc,
      dueDayOfWeek: offer.reporting.dueDayOfWeek,
      dueDayOfMonth: offer.reporting.dueDayOfMonth,
      format: offer.reporting.format,
    },
    referenceFiles:
      offer.referenceFiles?.map((f) => ({ fileName: f.fileName, fileUrl: f.fileUrl })) ?? [],
    referenceLinks:
      offer.referenceLinks?.map((l) => ({ description: l.description, link: l.link })) ?? [],
    timeline: offer.timeline?.map((t) => ({ status: t.status, at: t.at, note: t.note })) ?? [],
    rejectedReason: (offer as unknown as { rejectedReason?: string }).rejectedReason,
  };
};
