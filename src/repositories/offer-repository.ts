import BaseRepository from './baseRepositories/base-repository';
import { IOffer } from '../models/interfaces/offer.model.interface';
import { ClientSession,  UpdateQuery } from 'mongoose';
import { OfferModel } from '../models/offer.model';
import {
  IOfferRepository,
  FreelancerOfferQueryParamsDTO,
  ClientOfferQueryParamsDTO,
} from './interfaces/offer-repository.interface';

export class OfferRepository extends BaseRepository<IOffer> implements IOfferRepository {
  constructor() {
    super(OfferModel);
  }

  async createOffer(data: Partial<IOffer>): Promise<IOffer> {
    return await super.create(data);
  }

  async findAllForFreelancer(
    freelancerId: string,
    query: FreelancerOfferQueryParamsDTO,
  ): Promise<IOffer[]> {
    const { search, filters } = query;
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { freelancerId };
    if (filters?.status) filter.status = filters.status;
    if (filters?.offerType) filter.offerType = filters.offerType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return await super.findAll(filter, {
      skip,
      limit,
      populate: { path: 'clientId', select: '_id firstName lastName clientProfile.logo' },
    });
  }

  async countForFreelancer(
    freelancerId: string,
    query: FreelancerOfferQueryParamsDTO,
  ): Promise<number> {
    const { search, filters } = query;
    const filter: Record<string, unknown> = { freelancerId };
    if (filters?.status) filter.status = filters.status;
    if (filters?.offerType) filter.offerType = filters.offerType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await super.count(filter);
  }

  async findAllForClient(clientId: string, query: ClientOfferQueryParamsDTO): Promise<IOffer[]> {
    const { search, filters } = query;
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { clientId };
    if (filters?.status) filter.status = filters.status;
    if (filters?.offerType) filter.offerType = filters.offerType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return await super.findAll(filter, {
      skip,
      limit,
      populate: { path: 'freelancerId', select: '_id firstName lastName freelancerProfile.logo' },
    });
  }

  async countForClient(clientId: string, query: ClientOfferQueryParamsDTO): Promise<number> {
    const { search, filters } = query;
    const filter: Record<string, unknown> = { clientId };
    if (filters?.status) filter.status = filters.status;
    if (filters?.offerType) filter.offerType = filters.offerType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    return await super.count(filter);
  }

  async findOneForClient(clientId: string, offerId: string): Promise<IOffer | null> {
    return await super.findOne(
      { _id: offerId, clientId },
      {
        populate: [
          {
            path: 'freelancerId',
            select: '_id firstName lastName freelancerProfile.logo address.country',
          },
          { path: 'jobId', select: '_id title' },
          { path: 'proposalId', select: '_id' },
          { path: 'categoryId', select: '_id name' },
        ],
      },
    );
  }

  async findOneForFreelancer(freelancerId: string, offerId: string): Promise<IOffer | null> {
    return await super.findOne(
      { _id: offerId, freelancerId },
      {
        populate: [
          {
            path: 'clientId',
            select:
              '_id firstName lastName clientProfile.logo clientProfile.companyName address.country',
          },
          { path: 'jobId', select: '_id title' },
          { path: 'proposalId', select: '_id' },
          { path: 'categoryId', select: '_id name' },
        ],
      },
    );
  }

  async updateStatusById(offerId: string, status: string,session?: ClientSession): Promise<IOffer | null> {
    const now = new Date().toISOString();
    return await super.updateById(offerId, {
      $set: { status },
      $push: { timeline: { status, at: now } },
    }, session);
  }

  async updateStatusWithReason(
    offerId: string,
    status: string,
    reason?: string,
  ): Promise<IOffer | null> {
    const now = new Date().toISOString();
    const update: UpdateQuery<IOffer> = {
      $set: { status } as Partial<IOffer> & Record<string, unknown>,
      $push: {
        timeline: { status, at: now, note: reason || '' },
      } as unknown as UpdateQuery<IOffer>['$push'],
    };

    if (typeof reason === 'string' && reason.trim().length > 0) {
      (update.$set as Record<string, unknown>).rejectedReason = reason.trim();
    }

    return await super.updateById(offerId, update);
  }
}
