import { injectable } from 'tsyringe';
import BaseRepository from './baseRepositories/base-repository';
import { IContractTransaction } from '../models/interfaces/contract-transaction.model.interface';
import { ContractTransaction } from '../models/contract-transaction.model';
import { IContractTransactionRepository } from './interfaces/contract-transaction-repository.interface';
import { ClientSession, Types } from 'mongoose';
import { AdminWithdrawalStatsDTO } from 'src/dto/adminDTO/admin-withdrawal.dto';

@injectable()
export class ContractTransactionRepository
  extends BaseRepository<IContractTransaction>
  implements IContractTransactionRepository {
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
      .find({ clientId: new Types.ObjectId(clientId), purpose: 'withdrawal', role: "client" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countWithdrawalsByClientId(clientId: string): Promise<number> {
    return await this.model.countDocuments({
      clientId: new Types.ObjectId(clientId),
      purpose: 'withdrawal',
      role: 'client'
    });
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
          role: "client"
        },
      },
      { $group: { _id: null, totalWithdrawn: { $sum: '$amount' } } },
    ]);
    return result.length > 0 ? result[0].totalWithdrawn : 0;
  }

  async getFreelancerTotalEarnings(freelancerId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          freelancerId: new Types.ObjectId(freelancerId),
          purpose: { $in: ['release'] },
        },
      },
      {
        $group: {
          _id: null,
          totalAvailable: { $sum: '$amount' },
        },
      },
    ]);
    return result.length > 0 ? result[0].totalAvailable : 0;
  }

  async getFreelancerAvailableBalance(freelancerId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          freelancerId: new Types.ObjectId(freelancerId),
          purpose: { $in: ['release', 'withdrawal'] },
        },
      },
      {
        $group: {
          _id: null,
          totalReleased: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'release'] }, '$amount', 0],
            },
          },
          totalWithdrawn: {
            $sum: {
              $cond: [{ $eq: ['$purpose', 'withdrawal'] }, '$amount', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          availableBalance: {
            $subtract: ['$totalReleased', '$totalWithdrawn'],
          },
        },
      },
    ]);

    return result.length > 0 ? result[0].availableBalance : 0;
  }

  async findWithdrawalsByFreelancerIdWithPagination(
    freelancerId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<IContractTransaction[]> {
    console.log(status)
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {
      freelancerId: new Types.ObjectId(freelancerId),
      purpose: 'withdrawal',
      role: 'freelancer'
    };

    if (status) {
      (filter as any).status = status;
    }

    return await this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  }

  async countWithdrawalsByFreelancerId(freelancerId: string, status?: string): Promise<number> {
    const filter: Record<string, unknown> = {
      freelancerId: new Types.ObjectId(freelancerId),
      purpose: 'withdrawal',
      role: 'freelancer'
    };
    if (status) {
      (filter as any).status = status;
    }
    return await this.model.countDocuments(filter);
  }

  async findWithdrawalsForAdmin(
    page: number,
    limit: number,
    role?: string,
    status?: string,
  ): Promise<IContractTransaction[]> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {
      purpose: 'withdrawal',
    };

    if (role) {
      (filter as any).role = role;
    }

    if (status) {
      (filter as any).status = status;
    }

    return await this.model
      .find(filter)
      .populate('clientId', 'firstName lastName')
      .populate('freelancerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countWithdrawalsForAdmin(role?: string, status?: string): Promise<number> {
    const filter: Record<string, unknown> = {
      purpose: 'withdrawal',
    };

    if (role) {
      (filter as any).role = role;
    }

    if (status) {
      (filter as any).status = status;
    }

    return await this.model.countDocuments(filter);
  }

  async getPendingWithdraw(freelancerId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          freelancerId: new Types.ObjectId(freelancerId),
          purpose: { $in: ['withdrawal'] },
          status: "withdrawal_requested"
        },
      },
      {
        $group: {
          _id: null,
          pendingWithdraw: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          pendingWithdraw: "$pendingWithdraw",
        },
      },
    ]);

    return result.length > 0 ? result[0].pendingWithdraw : 0;
  }

  async getWithdrawStatsForAdmin(): Promise<AdminWithdrawalStatsDTO> {
    const result = await this.model.aggregate([
      {
        $match: {
          purpose: "withdrawal"
        }
      },
      {
        $group: {
          _id: null,
          pendingRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'withdrawal_requested'] }, 1, 0],
            },
          },
          totalPendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'withdrawal_requested'] }, '$amount', 0],
            },
          },
          totalWithdrawn: {
            $sum: {
              $cond: [{ $eq: ['$status', 'withdrawal_approved'] }, '$amount', 0],
            },
          }
        }
      },
      {
        $project: {
          pendingRequests: "$pendingRequests",
          totalPendingAmount: "$totalPendingAmount",
          totalWithdrawn: "$totalWithdrawn"
        }
      }
    ])

    const { pendingRequests, totalPendingAmount, totalWithdrawn } = result.length > 0 ? result[0]:{}

    return {
      pendingRequests:pendingRequests||0,
      totalPendingAmount:totalPendingAmount||0,
      totalWithdrawn:totalWithdrawn||0
    }
  }

  async findWithdrawalById(withdrawalId: string): Promise<IContractTransaction | null> {
    return await this.model
      .findById(withdrawalId)
      .populate('clientId', 'firstName lastName email avatar phone isVerified isClientBlocked')
      .populate('freelancerId', 'firstName lastName email avatar phone isVerified isFreelancerBlocked freelancerProfile')
      .lean();
  }

  async updateWithdrawalStatus(withdrawalId: string, status: string): Promise<IContractTransaction | null> {
    return await this.model
      .findByIdAndUpdate(
        withdrawalId,
        { status },
        { new: true }
      )
      .lean();
  }

  async findCommissionTransactionsWithPagination(
    startDate?: Date,
    endDate?: Date,
  ): Promise<IContractTransaction[]> {
    const filter: Record<string, unknown> = { purpose: 'commission' };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (filter.createdAt as Record<string, unknown>).$lte = endDate;
      }
    }

    return await this.model
      .find(filter)
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getRevenueStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRevenue: number;
    totalCommissions: number;
    totalTransactions: number;
    averageCommission: number;
  }> {
    const filter: Record<string, unknown> = { purpose: 'commission' };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (filter.createdAt as Record<string, unknown>).$lte = endDate;
      }
    }

    const result = await this.model.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalCommissions: { $sum: 1 },
        },
      },
    ]);

    const totalTransactions = await this.model.countDocuments({
      createdAt: filter.createdAt || { $exists: true },
    });

    if (result.length === 0) {
      return {
        totalRevenue: 0,
        totalCommissions: 0,
        totalTransactions,
        averageCommission: 0,
      };
    }

    const { totalRevenue, totalCommissions } = result[0];

    return {
      totalRevenue,
      totalCommissions,
      totalTransactions,
      averageCommission: totalCommissions > 0 ? totalRevenue / totalCommissions : 0,
    };
  }

  async getRevenueChartData(): Promise<
    { month: string; revenue: number; transactions: number }[]
  > {
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const result = await this.model.aggregate([
      {
        $match: {
          purpose: 'commission',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData: { month: string; revenue: number; transactions: number }[] = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(sixMonthsAgo);
      date.setMonth(sixMonthsAgo.getMonth() + i);

      const monthData = result.find(
        (r) => r._id.year === date.getFullYear() && r._id.month === date.getMonth() + 1,
      );

      chartData.push({
        month: monthNames[date.getMonth()],
        revenue: monthData ? monthData.revenue : 0,
        transactions: monthData ? monthData.transactions : 0,
      });
    }

    return chartData;
  }

  async getRevenueCategoryData(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ category: string; revenue: number }[]> {
    const filter: Record<string, unknown> = {
      purpose: 'commission',
      'metadata.category': { $exists: true },
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

    const result = await this.model.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$metadata.category',
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return result.map((item) => ({
      category: item._id || 'Other',
      revenue: item.revenue,
    }));
  }

  async getPreviousPeriodRevenue(startDate: Date, endDate: Date): Promise<number> {
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodDuration);
    const previousEndDate = new Date(startDate.getTime());

    const result = await this.model.aggregate([
      {
        $match: {
          purpose: 'commission',
          createdAt: { $gte: previousStartDate, $lt: previousEndDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalRevenue : 0;
  }

}
