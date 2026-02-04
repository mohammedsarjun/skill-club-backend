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

  async createTransaction(
    data: Partial<IContractTransaction>,
    session?: ClientSession,
  ): Promise<IContractTransaction> {
    return await super.create(data, session);
  }

  async findByContractId(contractId: string): Promise<IContractTransaction[]> {
    return await super.findAll({ contractId });
  }

  async findByMilestoneId(
    contractId: string,
    milestoneId: string,
  ): Promise<IContractTransaction[]> {
    return await super.findAll({ contractId, milestoneId });
  }

  async findByClientId(clientId: string): Promise<IContractTransaction[]> {
    return await this.model
      .find({ clientId })
      .populate('freelancerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findWithdrawalsByClientIdWithPagination(
    clientId: string,
    page: number,
    limit: number,
  ): Promise<IContractTransaction[]> {
    const skip = (page - 1) * limit;
    return await this.model
      .find({ clientId: new Types.ObjectId(clientId), purpose: 'withdrawal' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countWithdrawalsByClientId(clientId: string): Promise<number> {
    return await this.model.countDocuments({ clientId: new Types.ObjectId(clientId), purpose: 'withdrawal' });
  }

  async findSpentTransactionsByClientId(clientId: string): Promise<IContractTransaction[]> {
    return await this.model
      .find({
        clientId,
        purpose: { $in: ['funding', 'commission'] },
      })
      .populate('freelancerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();
  }

  async findRefundTransactionsByClientId(clientId: string): Promise<IContractTransaction[]> {
    return await this.model
      .find({
        clientId,
        purpose: 'refund',
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
    const filter: Record<string, unknown> = {
      freelancerId: new Types.ObjectId(freelancerId),
      purpose: 'release',
    };

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

  async countByFreelancerId(
    freelancerId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
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
          purpose: 'release',
        },
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

  async findTotalFundedAmountForMilestone(
    contractId: string,
    milestoneId: string,
  ): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          contractId: new Types.ObjectId(contractId),
          purpose: 'funding',
          milestoneId: new Types.ObjectId(milestoneId),
        },
      },
      { $group: { _id: null, totalFunded: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].totalFunded : 0;
  }

  async findHoldTransactionByContract(
    contractId: string,
    milestoneId?: string,
  ): Promise<IContractTransaction | null> {
    const filter: Record<string, unknown> = {
      contractId: new Types.ObjectId(contractId),
      purpose: 'hold',
    };

    if (milestoneId) {
      filter.milestoneId = new Types.ObjectId(milestoneId);
    }

    return await super.findOne(filter);
  }

  async updateTransactionStatusForFixedContract(
    contractId: string,
    status: IContractTransaction['status'],
  ): Promise<void> {
    await this.model.updateOne(
      { contractId: new Types.ObjectId(contractId), purpose: 'hold' },
      { $set: { status } },
    );
  }

  async updateTransactionStatusForMilestoneContract(
    contractId: string,
    milestoneId: string,
    status: IContractTransaction['status'],
  ): Promise<void> {
    await this.model.updateOne(
      {
        contractId: new Types.ObjectId(contractId),
        milestoneId: new Types.ObjectId(milestoneId),
        purpose: 'hold',
      },
      { $set: { status } },
    );
  }

  async updateTransactionStatusForWorklog(
    workLogId: string,
    status: IContractTransaction['status'],
    session?: ClientSession,
  ): Promise<void> {
    await this.model.updateOne(
      { workLogId: new Types.ObjectId(workLogId), purpose: 'hold' },
      { $set: { status } },
      { session },
    );
  }

  async updateTransactionStatusByWorklogId(
    workLogId: string,
    status: IContractTransaction['status'],
  ): Promise<void> {
    await this.model.updateOne(
      { workLogId: new Types.ObjectId(workLogId), purpose: 'hold' },
      { $set: { status } },
    );
  }

  async findActiveHoldTransactionsByWorklogIds(
    worklogIds: string[],
  ): Promise<IContractTransaction[]> {
    const objectIds = worklogIds.map((id) => new Types.ObjectId(id));
    return await super.findAll({
      workLogId: { $in: objectIds },
      purpose: 'hold',
      status: 'active_hold',
    });
  }

  async releaseHoldTransactionsToContract(worklogId: string): Promise<IContractTransaction | null> {
    const objectId = new Types.ObjectId(worklogId);
    return await super.update(
      {
        workLogId: objectId,
        purpose: 'hold',
        status: 'active_hold',
      },
      {
        $set: { status: 'released_back_to_contract' },
      },
    );
  }
  async findHourlyContractRefundAmount(contractId: string): Promise<number> {
    const result = await this.model.aggregate([
      { $match: { contractId: new Types.ObjectId(contractId) } },
      {
        $group: {
          _id: contractId,
          totalFunding: { $sum: { $cond: [{ $eq: ['$purpose', 'funding'] }, '$amount', 0] } },
          totalReleased: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'release'] }, '$amount', 0],
            },
          },
          totalHeld: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$purpose', 'hold'] }, { $eq: ['$status', 'active_hold'] }] },
                '$amount',
                0,
              ],
            },
          },
          totalRefunded: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'refund'] }, '$amount', 0],
            },
          },
          totalCommission: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'commission'] }, '$amount', 0],
            },
          },
          holdRefundsToContract: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$purpose', 'hold'] },
                    { $eq: ['$status', 'released_back_to_contract'] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          availableBalance: {
            $subtract: [
              {
                $subtract: ['$totalFunding', '$totalHeld'],
              },
              {
                $add: [
                  '$totalReleased',
                  '$totalRefunded',
                  '$totalCommission',
                  '$holdRefundsToContract',
                ],
              },
            ],
          },
        },
      },
    ]);
    return result.length > 0 ? result[0].availableBalance : 0;
  }

  async findTotalFundedByContractId(contractId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          contractId: new Types.ObjectId(contractId),
          purpose: 'funding',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async findTotalPaidToFreelancerByContractId(contractId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          contractId: new Types.ObjectId(contractId),
          purpose: 'release',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async findTotalCommissionByContractId(contractId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          contractId: new Types.ObjectId(contractId),
          purpose: 'commission',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async findTotalHeldByContractId(contractId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          contractId: new Types.ObjectId(contractId),
          purpose: 'hold',
          status: 'active_hold',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async findTotalRefundByContractId(contractId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          contractId: new Types.ObjectId(contractId),
          purpose: 'refund',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async findFinancialSummaryByContractId(contractId: string): Promise<{
    totalFunded: number;
    totalPaidToFreelancer: number;
    commissionPaid: number;
    totalHeld: number;
    totalRefund: number;
    availableContractBalance: number;
  }> {
    const result = await this.model.aggregate([
      {
        $match: {
          contractId: new Types.ObjectId(contractId),
        },
      },
      {
        $group: {
          _id: contractId,
          totalFunded: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'funding'] }, '$amount', 0],
            },
          },
          totalPaidToFreelancer: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'release'] }, '$amount', 0],
            },
          },
          commissionPaid: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'commission'] }, '$amount', 0],
            },
          },
          holdRefundsToContract: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$purpose', 'hold'] },
                    { $eq: ['$status', 'released_back_to_contract'] },
                  ],
                },
                '$amount',
                0,
              ],
            },
          },
          totalRefund: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'refund'] }, '$amount', 0],
            },
          },
          totalHeld: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$purpose', 'hold'] }, { $eq: ['$status', 'active_hold'] }] },
                '$amount',
                0,
              ],
            },
          },
        },
      },

      {
        $project: {
          totalFunded: 1,
          totalPaidToFreelancer: 1,
          commissionPaid: 1,
          totalHeld: 1,
          totalRefund: 1,
          availableContractBalance: {
            $subtract: [
              {
                $subtract: ['$totalFunded', '$totalHeld'],
              },
              {
                $add: [
                  '$totalPaidToFreelancer',
                  '$commissionPaid',
                  '$totalRefund',
                  '$holdRefundsToContract',
                ],
              },
            ],
          },
        },
      },
    ]);
    return result.length > 0
      ? {
          totalFunded: result[0].totalFunded,
          totalPaidToFreelancer: result[0].totalPaidToFreelancer,
          commissionPaid: result[0].commissionPaid,
          totalHeld: result[0].totalHeld,
          totalRefund: result[0].totalRefund,
          availableContractBalance: result[0].availableContractBalance,
        }
      : {
          totalFunded: 0,
          totalPaidToFreelancer: 0,
          commissionPaid: 0,
          totalHeld: 0,
          totalRefund: 0,
          availableContractBalance: 0,
        };
  }

  async updateHoldTransactionStatusToSplit(
    transactionId: string,
    clientRefundAmount: number,
    freelancerReleaseAmount: number,
  ): Promise<void> {
    await this.model.findByIdAndUpdate(transactionId, {
      status: 'amount_split_between_parties',
    });

    const holdTransaction = await this.model.findById(transactionId);
    if (!holdTransaction) {
      return;
    }

    if (clientRefundAmount > 0) {
      await this.model.create({
        contractId: holdTransaction.contractId,
        clientId: holdTransaction.clientId,
        freelancerId: holdTransaction.freelancerId,
        amount: clientRefundAmount,
        purpose: 'refund',
        status: 'refunded_back_to_client',
        description: 'Refund from dispute resolution - admin split decision',
        milestoneId: holdTransaction.milestoneId,
      });
    }

    if (freelancerReleaseAmount > 0) {
      await this.model.create({
        contractId: holdTransaction.contractId,
        clientId: holdTransaction.clientId,
        freelancerId: holdTransaction.freelancerId,
        amount: freelancerReleaseAmount,
        purpose: 'release',
        status: 'released_to_freelancer',
        description: 'Release from dispute resolution - admin split decision',
        milestoneId: holdTransaction.milestoneId,
      });
    }
  }

  async updateHoldTransactionStatusToReleased(transactionId: string): Promise<void> {
    await this.model.findByIdAndUpdate(transactionId, {
      status: 'released_to_freelancer',
    });
  }

  async findHoldTransactionByWorklog(
    contractId: string,
    worklogId: string,
  ): Promise<IContractTransaction | null> {
    return await super.findOne({
      contractId: new Types.ObjectId(contractId),
      workLogId: new Types.ObjectId(worklogId),
      purpose: 'hold',
    });
  }

  async getTotalFundedByClientId(clientId: string): Promise<number> {

    const result = await this.model.aggregate([
      {
        $match: {
          clientId: new Types.ObjectId(clientId),
          purpose: 'funding',
        },
      },
      { $group: { _id: null, totalFunded: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].totalFunded : 0;
  }

  async findTotalRefundByClientId(clientId: string): Promise<number> {

    const result = await this.model.aggregate([
      {
        $match: {
          clientId: new Types.ObjectId(clientId),
          purpose: 'refund',
        },
      },
      { $group: { _id: null, totalRefunded: { $sum: '$amount' } } },  
    ]);
    return result.length > 0 ? result[0].totalRefunded : 0;
  }

  async findTotalWithdrawalByClientId(clientId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          clientId: new Types.ObjectId(clientId),
          purpose: 'withdrawal',
        },
      },
      { $group: { _id: null, totalWithdrawn: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].totalWithdrawn : 0;
  }


}
