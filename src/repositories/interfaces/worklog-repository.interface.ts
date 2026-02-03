import mongoose from 'mongoose';
import { IWorklog } from '../../models/interfaces/worklog.model.interface';
import { IBaseRepository } from '../baseRepositories/interfaces/base-repository.interface';

export interface IWorklogRepository extends IBaseRepository<IWorklog> {
  createWorklog(data: Partial<IWorklog>): Promise<IWorklog>;
  getWorklogsByContractId(contractId: string): Promise<IWorklog[]>;
  getWorklogsByMilestoneId(milestoneId: string): Promise<IWorklog[]>;
  getWorklogById(worklogId: string): Promise<IWorklog | null>;
  getWorklogsByContractWithPagination(
    contractId: string,
    page: number,
    limit: number,
    status?: string
  ): Promise<IWorklog[]>;
  countWorklogsByContract(contractId: string, status?: string): Promise<number>;
  updateWorklogStatus(
    worklogId: string,
    status: 'approved' | 'rejected' | 'paid',
    reviewMessage?: string,
    session?: mongoose.ClientSession
  ): Promise<IWorklog | null>;
  getWorklogsForAutoPay(): Promise<IWorklog[]>;
  getWeeklyHoursWorked(contractId: string, freelancerId: string, weekStart: Date, weekEnd: Date): Promise<number>;
  updateDisputeWindowEndDate(
    worklogId: string,
    newEndDate: Date,
    session?: mongoose.ClientSession
  ): Promise<IWorklog | null>;
  findWorklogsWithExpiredDisputeWindow(): Promise<IWorklog[]>;
  hasPendingWorklogs(contractId: string): Promise<boolean>;
  getWorklogsByObjectId(worklogObjectId: mongoose.Types.ObjectId): Promise<IWorklog | null>;
}

