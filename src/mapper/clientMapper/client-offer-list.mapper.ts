import { IOffer } from '../../models/interfaces/offer.model.interface';
import { ClientOfferListItemDTO } from '../../dto/clientDTO/client-offer.dto';

function docIdToString(id: unknown): string {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (
    typeof id === 'object' &&
    id !== null &&
    'toString' in id &&
    typeof (id as { toString: unknown }).toString === 'function'
  ) {
    return (id as { toString(): string }).toString();
  }
  return '';
}

export const mapOfferModelToClientOfferListItemDTO = (offer: IOffer): ClientOfferListItemDTO => {
  const rawId =
    docIdToString((offer as unknown as Record<string, unknown>)._id) ||
    docIdToString((offer as unknown as Record<string, unknown>).id);
  const freelancerPop = offer.freelancerId as unknown as Partial<{
    firstName?: string;
    lastName?: string;
    freelancerProfile?: { logo?: string };
    toString?: () => string;
  }>;
  const freelancer =
    typeof offer.freelancerId === 'object' && offer.freelancerId !== null
      ? {
          freelancerId: freelancerPop.toString?.() || '',
          firstName: freelancerPop.firstName,
          lastName: freelancerPop.lastName,
          logo: freelancerPop.freelancerProfile?.logo,
        }
      : undefined;

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
    freelancer,
  };
};
