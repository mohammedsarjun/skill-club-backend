import { injectable } from 'tsyringe';
import BaseRepository from './baseRepositories/base-repository';
import { IContractTransaction } from '../models/interfaces/contract-transaction.model.interface';
import { ContractTransaction } from '../models/contract-transaction.model';
import { IContractTransactionRepository } from './interfaces/contract-transaction-repository.interface';
import { ClientSession, Types } from 'mongoose';


@injectable()
export class ContractTransactionRepository
  extends BaseRepository<IContractTransaction>
  implements IContractTransactionRepository
{
  constructor() {
    super(ContractTransaction);
  }

  async createTransaction(data: Partial<IContractTransaction>, session?: ClientSession): Promise<IContractTransaction> {
    return await super.create(data, session);
  }

  async findByContractId(contractId: string): Promise<IContractTransaction[]> {
    return await super.findAll({ contractId });
  }

  async findByMilestoneId(contractId: string, milestoneId: string): Promise<IContractTransaction[]> {
    return await super.findAll({ contractId, milestoneId });
  }

  async findByClientId(clientId: string): Promise<IContractTransaction[]> {
    return await this.model
      .find({ clientId })
      .populate('freelancerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findSpentTransactionsByClientId(clientId: string): Promise<IContractTransaction[]> {
    return await this.model
      .find({ 
        clientId, 
        purpose: { $in: ['funding', 'commission'] } 
      })
      .populate('freelancerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findRefundTransactionsByClientId(clientId: string): Promise<IContractTransaction[]> {
    return await this.model
      .find({ 
        clientId, 
        purpose: 'refund' 
      })
      .populate('freelancerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findTotalFundedAmountForFixedContract(contractId: string): Promise<number> {  
    const result = await this.model.aggregate([
      { $match: { contractId: new Types.ObjectId(contractId), purpose: 'funding' } },
      { $group: { _id: null, totalFunded: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].totalFunded : 0;
  }

  async findByFreelancerIdWithPagination(
    freelancerId: string,
    page: number,
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<IContractTransaction[]> {
    const filter: Record<string, unknown> = { freelancerId: new Types.ObjectId(freelancerId),purpose:'release' };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (filter.createdAt as Record<string, unknown>).$lte = endDate;
      }
    }

    

    const skip = (page - 1) * limit;
    
    return await this.model
      .find(filter)
      .populate('clientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByFreelancerId(freelancerId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const filter: Record<string, unknown> = { freelancerId: new Types.ObjectId(freelancerId) };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (filter.createdAt as Record<string, unknown>).$lte = endDate;
      }
    }

    return await this.model.countDocuments(filter);
  }

  async findPendingEarningsByFreelancerId(freelancerId: string): Promise<number> {
    const result = await this.model.aggregate([
      { 
        $match: { 
          freelancerId: new Types.ObjectId(freelancerId),
          purpose: 'release'
        } 
      },
      { $group: { _id: null, totalPending: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].totalPending : 0;
  }

  async getRevenueByPeriod(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'month' | 'year',
  ): Promise<{ date: Date; revenue: number }[]> {
    const dateFormat =
      groupBy === 'day'
        ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        : groupBy === 'month'
          ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
          : { $dateToString: { format: '%Y', date: '$createdAt' } };

    const result = await this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          purpose: 'commission',
        },
      },
      {
        $group: {
          _id: dateFormat,
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map((item) => ({
      date: new Date(item._id),
      revenue: item.revenue,
    }));
  }

  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await this.model.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          purpose: 'commission',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async findTotalFundedAmountForMilestone(contractId: string, milestoneId: string): Promise<number> {
      const result = await this.model.aggregate([
      { $match: { contractId: new Types.ObjectId(contractId), purpose: 'funding',milestoneId:new Types.ObjectId(milestoneId) } },
      { $group: { _id: null, totalFunded: { $sum: '$amount' } } },
    ]);
        return result.length > 0 ? result[0].totalFunded : 0;
  }

}