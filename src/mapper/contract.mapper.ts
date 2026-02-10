import { IOffer, OfferMilestone,} from '../models/interfaces/offer.model.interface';
import { IContract } from '../models/interfaces/contract.model.interface';
import { Types } from 'mongoose';

export const mapOfferToContract = (offer: IOffer): Partial<IContract> => {
  const calculateEndDate = (): Date => {
    if (offer.expectedEndDate) {
      return offer.expectedEndDate;
    }
    if (offer.paymentType === 'fixed_with_milestones' && offer.milestones && offer.milestones.length > 0) {
      const lastMilestone = offer.milestones.reduce((latest, current) => {
        return new Date(current.expectedDelivery) > new Date(latest.expectedDelivery) ? current : latest;
      });
      return lastMilestone.expectedDelivery;
    }
    return new Date();
  };

  return {
    offerId: offer._id as Types.ObjectId,
    clientId: offer.clientId,
    freelancerId: offer.freelancerId,
    jobId: offer.jobId,
    proposalId: offer.proposalId,
    categoryId: offer.categoryId,
    paymentType: offer.paymentType,
    budget: offer.budget,
    hourlyRate: offer.hourlyRate,
    estimatedHoursPerWeek: offer.estimatedHoursPerWeek,
    milestones: offer.milestones?.map((milestone: OfferMilestone) => ({
      milestoneId: new Types.ObjectId(),
      title: milestone.title,
      amount: milestone.amount,
      expectedDelivery: milestone.expectedDelivery,
      status: 'pending_funding' as const,
      disputeEligible: false,
      disputeWindowEndsAt: undefined,
      isFunded: false,
      revisionsAllowed: typeof milestone.revisions === 'number' ? milestone.revisions : offer.revisions || 0,
    })),
    revisions: typeof offer.revisions === 'number' ? offer.revisions : 0,
    revisionAllowed: typeof offer.revisions === 'number' ? offer.revisions : 0,
    title: offer.title,
    description: offer.description,
    expectedStartDate: new Date(),
    expectedEndDate: calculateEndDate(),
    referenceFiles: offer.referenceFiles,
    referenceLinks: offer.referenceLinks,
    reporting: offer.reporting,
    status: 'pending_funding' as const,
    fundedAmount: 0,
    totalPaid: 0,
    balance:  0,
  };
};
