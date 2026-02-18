import { injectable } from 'tsyringe';
import { ClientSession, Types } from 'mongoose';
import { CancellationRequest } from '../models/cancellation-request.model';
import { ICancellationRequest } from '../models/interfaces/cancellation-request.model.interface';
import { ICancellationRequestRepository } from './interfaces/cancellation-request-repository.interface';
import BaseRepository from './baseRepositories/base-repository';

@injectable()
export class CancellationRequestRepository
  extends BaseRepository<ICancellationRequest>
  implements ICancellationRequestRepository
{
  constructor() {
    super(CancellationRequest);
  }

  async create(
    data: Partial<ICancellationRequest>,
    session?: ClientSession,
  ): Promise<ICancellationRequest> {
    const [result] = await this.model.create([data], { session });
    return result;
  }

  async findById(id: string): Promise<ICancellationRequest | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await this.model.findById(id).exec();
  }

  async findByContractId(contractId: string): Promise<ICancellationRequest | null> {
    if (!Types.ObjectId.isValid(contractId)) return null;
    return await this.model
      .findOne({ contractId: new Types.ObjectId(contractId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(
    id: string,
    status: ICancellationRequest['status'],
    respondedBy?: string,
    responseMessage?: string,
    session?: ClientSession,
  ): Promise<ICancellationRequest | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updateData: Partial<ICancellationRequest> = {
      status,
      respondedAt: new Date(),
    };

    if (respondedBy && Types.ObjectId.isValid(respondedBy)) {
      updateData.respondedBy = new Types.ObjectId(respondedBy);
    }

    if (responseMessage) {
      updateData.responseMessage = responseMessage;
    }

    return await this.model.findByIdAndUpdate(id, updateData, { new: true, session }).exec();
  }

  async findPendingByContractId(contractId: string): Promise<ICancellationRequest | null> {
    if (!Types.ObjectId.isValid(contractId)) return null;
    return await this.model
      .findOne({
        contractId: new Types.ObjectId(contractId),
        status: 'pending',
      })
      .exec();
  }
}
