import BaseRepository from '../baseRepositories/base-repository';
import { IOffer, OfferStatus, OfferType } from '../../models/interfaces/offer.model.interface';
import { ClientSession } from 'mongoose';

export interface FreelancerOfferQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {
    status?: OfferStatus;
    offerType?: OfferType;
  };
}

export interface ClientOfferQueryParamsDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters: {
    status?: OfferStatus;
    offerType?: OfferType;
  };
}

export interface IOfferRepository extends BaseRepository<IOffer> {
  createOffer(data: Partial<IOffer>): Promise<IOffer>;
  findAllForFreelancer(
    freelancerId: string,
    query: FreelancerOfferQueryParamsDTO,
  ): Promise<IOffer[]>;
  countForFreelancer(freelancerId: string, query: FreelancerOfferQueryParamsDTO): Promise<number>;
  findOneForFreelancer(freelancerId: string, offerId: string): Promise<IOffer | null>;
  findOneForClient(clientId: string, offerId: string): Promise<IOffer | null>;
  findAllForClient(clientId: string, query: ClientOfferQueryParamsDTO): Promise<IOffer[]>;
  countForClient(clientId: string, query: ClientOfferQueryParamsDTO): Promise<number>;
  updateStatusById(offerId: string, status: string,session?: ClientSession): Promise<IOffer | null>;
  updateStatusWithReason(offerId: string, status: string, reason?: string): Promise<IOffer | null>;
}
