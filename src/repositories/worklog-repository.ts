import { injectable } from 'tsyringe';
import { WorklogModel } from '../models/worklog.model';
import { IWorklog } from '../models/interfaces/worklog.model.interface';
import { IWorklogRepository } from './interfaces/worklog-repository.interface';
import BaseRepository from './baseRepositories/base-repository';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

@injectable()
export class WorklogRepository extends BaseRepository<IWorklog> implements IWorklogRepository {
  constructor() {
    super(WorklogModel);
  }

  async createWorklog(data: Partial<IWorklog>): Promise<IWorklog> {
    const worklogData = {
      ...data,
      worklogId: uuidv4(),
    };
    return this.create(worklogData);
  }

  async getWorklogsByContractId(contractId: string): Promise<IWorklog[]> {
    return this.findAll({ contractId });
  }

  async getWorklogsByMilestoneId(milestoneId: string): Promise<IWorklog[]> {
    return this.findAll({ milestoneId });
  }

  async getWorklogById(worklogId: string): Promise<IWorklog | null> {
    return this.findOne({ worklogId });
  }

  async getWorklogsByObjectId(worklogObjectId: mongoose.Types.ObjectId): Promise<IWorklog | null> {
    return this.findOne({ _id: worklogObjectId });
  }

  async getWorklogsByContractWithPagination(
    contractId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<IWorklog[]> {
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { contractId };
    if (status) {
      filter.status = status;
    }
    return this.findAll(filter, {
      skip,
      limit,
      populate: { path: 'freelancerId', select: 'firstName lastName' },
    });
  }

  async countWorklogsByContract(contractId: string, status?: string): Promise<number> {
    const filter: Record<string, unknown> = { contractId };
    if (status) {
      filter.status = status;
    }
    return this.model.countDocuments(filter).exec();
  }

  async updateWorklogStatus(
    worklogId: string,
    status: 'approved' | 'rejected' | 'paid',
    reviewMessage?: string,
    session?: mongoose.ClientSession,
  ): Promise<IWorklog | null> {
    const updateData: Partial<IWorklog> = {
      status,
      reviewedAt: new Date(),
    };
    if (reviewMessage) {
      updateData.reviewMessage = reviewMessage;
    }
    return this.model.findOneAndUpdate({ worklogId }, updateData, { new: true, session }).exec();
  }

  async getWorklogsForAutoPay(): Promise<IWorklog[]> {
    return super.findAll({ status: { $in: ['approved', 'pending'] } });
  }

  async getWeeklyHoursWorked(
    contractId: string,
    freelancerId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<number> {
    const worklogs = await this.model
      .find({
        contractId: new mongoose.Types.ObjectId(contractId),
        freelancerId: new mongoose.Types.ObjectId(freelancerId),
        startTime: { $gte: weekStart, $lt: weekEnd },
      })
      .exec();

    const totalMilliseconds = worklogs.reduce((sum, log) => sum + log.duration, 0);
    return totalMilliseconds / (1000 * 60 * 60);
  }

  async updateDisputeWindowEndDate(
    worklogId: string,
    newEndDate: Date,
    session?: mongoose.ClientSession,
  ): Promise<IWorklog | null> {
    return this.model
      .findOneAndUpdate({ worklogId }, { disputeWindowEndDate: newEndDate }, { new: true, session })
      .exec();
  }

  async findWorklogsWithExpiredDisputeWindow(): Promise<IWorklog[]> {
    return this.model
      .find({
        status: 'rejected',
        disputeWindowEndDate: { $lt: new Date() },
      })
      .exec();
  }

  async hasPendingWorklogs(contractId: string): Promise<boolean> {
    const count = await this.model
      .countDocuments({
        contractId,
        status: 'submitted',
      })
      .exec();
    return count > 0;
  }
}
