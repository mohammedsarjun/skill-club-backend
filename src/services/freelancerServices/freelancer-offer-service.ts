import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerOfferService } from './interfaces/freelancer-offer-service.interface';
import {
  IOfferRepository,
  FreelancerOfferQueryParamsDTO,
} from '../../repositories/interfaces/offer-repository.interface';
import { mapOfferModelToFreelancerOfferDetailDTO } from '../../mapper/freelancerMapper/freelancer-offer.mapper';
import { mapOfferToContract } from '../../mapper/contract.mapper';
import {
  FreelancerOfferListResultDTO,
  FreelancerOfferDetailDTO,
} from '../../dto/freelancerDTO/freelancer-offer.dto';
import { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IContractActivityService } from '../commonServices/interfaces/contract-activity-service.interface';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import mongoose, { Types } from 'mongoose';

@injectable()
export class FreelancerOfferService implements IFreelancerOfferService {
  private _offerRepository: IOfferRepository;
  private _jobRepository: IJobRepository;
  private _contractRepository: IContractRepository;
  private _contractActivityService: IContractActivityService;
  constructor(
    @inject('IOfferRepository') offerRepository: IOfferRepository,
    @inject('IJobRepository') jobRepository: IJobRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IContractActivityService') contractActivityService: IContractActivityService
  ) {
    this._offerRepository = offerRepository;
    this._jobRepository = jobRepository;
    this._contractRepository = contractRepository;
    this._contractActivityService = contractActivityService;
  }

  async rejectOffer(
    freelancerId: string,
    offerId: string,
    reason?: string,
  ): Promise<{ rejected: boolean }> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(offerId)) {
      throw new AppError('Invalid offerId', HttpStatus.BAD_REQUEST);
    }

    const existing = await this._offerRepository.findOneForFreelancer(freelancerId, offerId);
    if (!existing) {
      throw new AppError('Offer not found or not owned by freelancer', HttpStatus.NOT_FOUND);
    }

    if (existing.status === 'accepted' || existing.status === 'withdrawn') {
      throw new AppError('Cannot reject this offer', HttpStatus.BAD_REQUEST);
    }

    await this._offerRepository.updateStatusWithReason(offerId, 'rejected', reason);
    return { rejected: true };
  }

  async acceptOffer(
    freelancerId: string,
    offerId: string,
  ): Promise<{ accepted: boolean; contractId: string }> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(offerId)) {
      throw new AppError('Invalid offerId', HttpStatus.BAD_REQUEST);
    }

    const existing = await this._offerRepository.findOneForFreelancer(freelancerId, offerId);
    if (!existing) {
      throw new AppError('Offer not found or not owned by freelancer', HttpStatus.NOT_FOUND);
    }

    if (existing.status !== 'pending') {
      throw new AppError('Cannot accept this offer', HttpStatus.BAD_REQUEST);
    }

    const existingContract = await this._contractRepository.findByOfferId(offerId);
    if (existingContract) {
      throw new AppError('Contract already exists for this offer', HttpStatus.BAD_REQUEST);
    }

    const contractData = mapOfferToContract(existing);

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const contract = await this._contractRepository.createContract(contractData, session);

      const contractId = contract._id as unknown as Types.ObjectId;
      
      await this._contractActivityService.logActivity(
        contractId,
        'contract_created',
        'system',
        undefined,
        'Contract Created',
        `Contract created from accepted offer. Payment type: ${contractData.paymentType}`,
        undefined,
        session
      );

      if (contractData.paymentType === 'hourly') {
        await this._contractRepository.updateStatusById(contractId.toString(), 'held', session);
      } else {
        await this._contractRepository.updateStatusById(
          contractId.toString(),
          'pending_funding',
          session,
        );
      }
      await this._offerRepository.updateStatusById(offerId, 'accepted', session);

      await session.commitTransaction();
      return { accepted: true, contractId: contract.contractId };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getAllOffers(
    freelancerId: string,
    query: FreelancerOfferQueryParamsDTO,
  ): Promise<FreelancerOfferListResultDTO> {
    // sanitize query defaults
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 10;
    const normalized: FreelancerOfferQueryParamsDTO = {
      search: query.search?.trim() || undefined,
      page,
      limit,
      filters: {
        status: query.filters?.status,
        offerType: query.filters?.offerType,
      },
    };

    const [offers, total] = await Promise.all([
      this._offerRepository.findAllForFreelancer(freelancerId, normalized),
      this._offerRepository.countForFreelancer(freelancerId, normalized),
    ]);

    return {
      items: offers.map(mapOfferModelToFreelancerOfferDetailDTO),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async getOfferDetail(
    freelancerId: string,
    offerId: string,
  ): Promise<FreelancerOfferDetailDTO | null> {
    const offer = await this._offerRepository.findOneForFreelancer(freelancerId, offerId);
    if (!offer) return null;
    const dto = mapOfferModelToFreelancerOfferDetailDTO(offer);

    let clientJobsCount: number | undefined;
    const clientId = (
      offer.clientId as unknown as { _id?: { toString(): string } }
    )._id?.toString();
    if (clientId) {
      clientJobsCount = await this._jobRepository.countAllJobsByClientId(clientId);
    }
    return {
      ...dto,
      clientTotalJobsPosted: clientJobsCount,
    };
  }
}
