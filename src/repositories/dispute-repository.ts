import { injectable } from 'tsyringe';
import BaseRepository from './baseRepositories/base-repository';
import { IDispute } from '../models/interfaces/dispute.model.interface';
import { Dispute } from '../models/dispute.model';
import { IDisputeRepository } from './interfaces/dispute-repository.interface';
import { AdminDisputeQueryParamsDTO } from '../dto/adminDTO/admin-dispute.dto';

@injectable()
export class DisputeRepository extends BaseRepository<IDispute> implements IDisputeRepository {
  constructor() {
    super(Dispute);
  }

  async createDispute(data: Partial<IDispute>): Promise<IDispute> {
    return await super.create(data);
  }

  async findDisputeById(disputeId: string): Promise<IDispute | null> {
    return await super.findById(disputeId);
  }

  async findDisputesByContractId(contractId: string): Promise<IDispute[]> {
    return await super.findAll({ contractId });
  }

  async findActiveDisputeByContract(contractId: string): Promise<IDispute | null> {
    return await super.findOne({
      contractId,
      status: { $in: ['open', 'under_review'] },
    });
  }

  async findActiveDisputeByWorklog(worklogId: string): Promise<IDispute | null> {
    return await super.findOne({
      scopeId: worklogId,
      scope: 'worklog',
      status: { $in: ['open', 'under_review'] },
    });
  }

  async updateDisputeStatus(
    disputeId: string,
    status: 'open' | 'under_review' | 'resolved' | 'rejected',
  ): Promise<IDispute | null> {
    return await super.updateById(disputeId, { status });
  }

  async resolveDispute(
    disputeId: string,
    resolution: {
      outcome: 'refund_client' | 'pay_freelancer' | 'split';
      clientAmount: number;
      freelancerAmount: number;
      decidedBy: 'admin' | 'system';
    },
  ): Promise<IDispute | null> {
    return await super.updateById(disputeId, {
      status: 'resolved',
      resolution: {
        ...resolution,
        decidedAt: new Date(),
      },
    });
  }

  async findAllForAdmin(query: AdminDisputeQueryParamsDTO): Promise<IDispute[]> {
    const { search, filters } = query;
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (filters?.reasonCode) filter.reasonCode = filters.reasonCode;
    if (search) {
      filter.$or = [
        { disputeId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const disputes = await this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({
        path: 'contractId',
        select: 'title clientId freelancerId',
        populate: [
          { path: 'clientId', select: 'firstName lastName' },
          { path: 'freelancerId', select: 'firstName lastName' },
        ],
      })
      .exec();

    return disputes;
  }

  async countForAdmin(query: AdminDisputeQueryParamsDTO): Promise<number> {
    const { search, filters } = query;
    const filter: Record<string, unknown> = {};
    if (filters?.reasonCode) filter.reasonCode = filters.reasonCode;
    if (search) {
      filter.$or = [
        { disputeId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    return await super.count(filter);
  }
}
