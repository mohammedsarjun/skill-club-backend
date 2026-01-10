import {
  FreelancerOfferListResultDTO,
  FreelancerOfferDetailDTO,
  FreelancerOfferQueryParamsDTO,
} from '../../../dto/freelancerDTO/freelancer-offer.dto';

export interface IFreelancerOfferService {
  getAllOffers(
    freelancerId: string,
    query: FreelancerOfferQueryParamsDTO,
  ): Promise<FreelancerOfferListResultDTO>;
  getOfferDetail(freelancerId: string, offerId: string): Promise<FreelancerOfferDetailDTO | null>;
  rejectOffer(
    freelancerId: string,
    offerId: string,
    reason?: string,
  ): Promise<{ rejected: boolean }>;
  acceptOffer(
    freelancerId: string,
    offerId: string,
  ): Promise<{ accepted: boolean; contractId: string }>;
}
