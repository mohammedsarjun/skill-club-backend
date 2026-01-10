import { IOffer } from '../../models/interfaces/offer.model.interface';
import { ClientOfferDetailDTO } from '../../dto/clientDTO/client-offer.dto';
import { Types } from 'mongoose';

function idToString(id: unknown): string | undefined {
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

export const mapOfferModelToClientOfferDetailDTO = (offer: IOffer): ClientOfferDetailDTO => {
  const rawId = idToString((offer as unknown as Record<string, unknown>)._id) || '';
  const freelancerPop = offer.freelancerId as unknown as Partial<{
    _id?: Types.ObjectId;
    firstName?: string;
    lastName?: string;
    freelancerProfile?: { logo?: string };
    address?: { country?: string };
    toString?: () => string;
  }>;
  const jobPop = offer.jobId as unknown as Partial<{ title?: string }>;
  console.log((offer as unknown as { rejectedReason?: string }).rejectedReason);
  return {
    offerId: rawId,
    title: offer.title,
    description: offer.description,
    paymentType: offer.paymentType,
    budget: offer.budget,
    hourlyRate: offer.hourlyRate,
    status: offer.status,
    createdAt: offer.createdAt!,
    expiresAt: offer.expiresAt,
    jobId: offer.jobId?.toString(),
    proposalId: offer.proposalId?.toString(),
    jobTitle: jobPop?.title,
    freelancer:
      typeof offer.freelancerId === 'object' && offer.freelancerId !== null
        ? {
            freelancerId: freelancerPop?._id?.toString() || '',
            firstName: freelancerPop.firstName,
            lastName: freelancerPop.lastName,
            logo: freelancerPop.freelancerProfile?.logo,
            country: freelancerPop.address?.country,
            rating: undefined,
          }
        : undefined,
    milestones: offer.milestones?.map((m) => ({
      title: m.title,
      amount: m.amount,
      expectedDelivery: m.expectedDelivery,
    })),
    expectedStartDate: offer.expectedStartDate,
    expectedEndDate: offer.expectedEndDate,
    communication: offer.communication
      ? {
          preferredMethod: offer.communication.preferredMethod,
          meetingFrequency: offer.communication.meetingFrequency,
          meetingDayOfWeek: offer.communication.meetingDayOfWeek,
          meetingDayOfMonth: offer.communication.meetingDayOfMonth,
          meetingTimeUtc: offer.communication.meetingTimeUtc,
        }
      : undefined,
    reporting: offer.reporting
      ? {
          frequency: offer.reporting.frequency,
          dueTimeUtc: offer.reporting.dueTimeUtc,
          dueDayOfWeek: offer.reporting.dueDayOfWeek,
          dueDayOfMonth: offer.reporting.dueDayOfMonth,
          format: offer.reporting.format,
        }
      : undefined,
    referenceFiles: offer.referenceFiles?.map((f) => ({
      fileName: f.fileName,
      fileUrl: f.fileUrl,
    })),
    referenceLinks: offer.referenceLinks?.map((l) => ({
      description: l.description,
      link: l.link,
    })),
    timeline: offer.timeline?.map((t) => ({ status: t.status, at: t.at, note: t.note })),
    rejectedReason: (offer as unknown as { rejectedReason?: string }).rejectedReason,
  };
};
