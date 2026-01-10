import { IOffer } from '../../models/interfaces/offer.model.interface';
import { ClientOfferResponseDTO } from '../../dto/clientDTO/client-offer.dto';

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

export const mapOfferModelToClientOfferResponseDTO = (offer: IOffer): ClientOfferResponseDTO => {
  const rawObj = offer as unknown as Record<string, unknown>;
  const rawId = docIdToString(rawObj._id) || docIdToString(rawObj.id) || '';
  return {
    offerId: rawId,
    freelancerId: offer.freelancerId.toString(),
    proposalId: offer.proposalId?.toString(),
    jobId: offer.jobId?.toString(),
    status: offer.status,
    title: offer.title,
    description: offer.description,
    paymentType: offer.paymentType,
    budget: offer.budget,
    hourlyRate: offer.hourlyRate,
    milestones: offer.milestones?.map((m) => ({
      title: m.title,
      amount: m.amount,
      expectedDelivery: m.expectedDelivery,
    })),
    expectedEndDate: offer.expectedEndDate,
    expiresAt: offer.expiresAt,
    createdAt: offer.createdAt!,
  };
};
