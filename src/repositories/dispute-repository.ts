import { injectable } from 'tsyringe';
import BaseRepository from './baseRepositories/base-repository';
import { IDispute } from '../models/interfaces/dispute.model.interface';
import { Dispute } from '../models/dispute.model';
import { IDisputeRepository } from './interfaces/dispute-repository.interface';

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
}
