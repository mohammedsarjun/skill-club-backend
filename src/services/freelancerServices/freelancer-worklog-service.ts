import { injectable, inject } from 'tsyringe';
import { IFreelancerWorklogService } from './interfaces/freelancer-worklog-service.interface';
import { IWorklogRepository } from '../../repositories/interfaces/worklog-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import {
  SubmitWorklogDTO,
  WorklogResponseDTO,
  WorklogListResponseDTO,
  WorklogDetailDTO,
} from '../../dto/freelancerDTO/freelancer-worklog.dto';
import { WorklogValidationResponseDTO } from '../../dto/freelancerDTO/freelancer-worklog-validation.dto';
import { RaiseWorklogDisputeDTO } from '../../dto/freelancerDTO/freelancer-worklog-dispute.dto';
import { DisputeResponseDTO } from '../../dto/freelancerDTO/freelancer-dispute.dto';
import {
  mapWorklogToResponseDTO,
  mapWorklogToListItemDTO,
  mapWorklogToDetailDTO,
} from '../../mapper/freelancerMapper/freelancer-worklog.mapper';
import { mapDisputeToResponseDTO } from '../../mapper/freelancerMapper/freelancer-dispute.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { Types } from 'mongoose';
import { IContractTransactionRepository } from 'src/repositories/interfaces/contract-transaction-repository.interface';
import { IDisputeRepository } from '../../repositories/interfaces/dispute-repository.interface';
import { IContractActivityService } from '../commonServices/interfaces/contract-activity-service.interface';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { DISPUTE_REASONS } from '../../contants/dispute.constants';

@injectable()
export class FreelancerWorklogService implements IFreelancerWorklogService {
  private _worklogRepository: IWorklogRepository;
  private _contractRepository: IContractRepository;
  private _contractTransactionRepository: IContractTransactionRepository;
  private _disputeRepository: IDisputeRepository;
  private _contractActivityService: IContractActivityService;

  constructor(
    @inject('IWorklogRepository') worklogRepository: IWorklogRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
    @inject('IDisputeRepository') disputeRepository: IDisputeRepository,
    @inject('IContractActivityService') contractActivityService: IContractActivityService,
  ) {
    this._worklogRepository = worklogRepository;
    this._contractRepository = contractRepository;
    this._contractTransactionRepository = contractTransactionRepository;
    this._disputeRepository = disputeRepository;
    this._contractActivityService = contractActivityService;
  }

  async submitWorklog(freelancerId: string, data: SubmitWorklogDTO): Promise<WorklogResponseDTO> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      data.contractId,
      freelancerId,
    );

    if (!contract) {
      throw new AppError('Contract not found or unauthorized', HttpStatus.NOT_FOUND);
    }

    if (contract.status !== 'active') {
      throw new AppError('Contract must be active to submit worklogs', HttpStatus.BAD_REQUEST);
    }

    if (data.files.length === 0) {
      throw new AppError('At least one proof of work file is required', HttpStatus.BAD_REQUEST);
    }

    if (data.duration <= 0) {
      throw new AppError('Duration must be greater than zero', HttpStatus.BAD_REQUEST);
    }

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - data.duration);

    const worklog = await this._worklogRepository.createWorklog({
      contractId: new Types.ObjectId(data.contractId),
      milestoneId: data.milestoneId ? new Types.ObjectId(data.milestoneId) : undefined,
      freelancerId: new Types.ObjectId(freelancerId),
      startTime,
      endTime,
      duration: data.duration,
      files: data.files,
      description: data.description,
      status: 'submitted',
    });

    const amountToHold = (contract.hourlyRate || 0) * (data.duration / 3600000);

    await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(data.contractId),
      workLogId: new Types.ObjectId(worklog._id),
      amount: amountToHold,
      purpose: 'hold',
      status: 'active_hold',
      description: 'Worklog has been submitted by the freelancer, so the funds are now on hold.',
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
    });

    const hoursWorked = data.duration / 3600000;
    await this._contractActivityService.logActivity(
      new Types.ObjectId(data.contractId),
      'work_logged',
      'freelancer',
      new Types.ObjectId(freelancerId),
      'Work Logged',
      `Freelancer logged ${hoursWorked.toFixed(2)} hours of work. Amount: ₹${amountToHold.toLocaleString()}`,
      {
        worklogId: worklog._id?.toString(),
        hours: hoursWorked,
        amount: amountToHold,
        filesCount: data.files.length,
      },
    );

    return mapWorklogToResponseDTO(worklog);
  }

  async getWorklogsByContract(
    freelancerId: string,
    contractId: string,
  ): Promise<WorklogResponseDTO[]> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
    );

    if (!contract) {
      throw new AppError('Contract not found or unauthorized', HttpStatus.NOT_FOUND);
    }

    const worklogs = await this._worklogRepository.getWorklogsByContractId(contractId);
    return worklogs.map(mapWorklogToResponseDTO);
  }

  async getWorklogsListByContract(
    freelancerId: string,
    contractId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<WorklogListResponseDTO> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
    );

    if (!contract) {
      throw new AppError('Contract not found or unauthorized', HttpStatus.NOT_FOUND);
    }

    const worklogs = await this._worklogRepository.getWorklogsByContractWithPagination(
      contractId,
      page,
      limit,
      status,
    );
    const total = await this._worklogRepository.countWorklogsByContract(contractId, status);
    const pages = Math.ceil(total / limit);

    return {
      items: worklogs.map(mapWorklogToListItemDTO),
      page,
      limit,
      total,
      pages,
    };
  }

  async getWorklogDetail(
    freelancerId: string,
    contractId: string,
    worklogId: string,
  ): Promise<WorklogDetailDTO> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
    );

    if (!contract) {
      throw new AppError('Contract not found or unauthorized', HttpStatus.NOT_FOUND);
    }

    const worklog = await this._worklogRepository.getWorklogById(worklogId);

    if (!worklog) {
      throw new AppError('Worklog not found', HttpStatus.NOT_FOUND);
    }

    if (worklog.contractId.toString() !== contractId) {
      throw new AppError('Worklog does not belong to this contract', HttpStatus.FORBIDDEN);
    }

    if (worklog.freelancerId.toString() !== freelancerId) {
      throw new AppError('Unauthorized access to worklog', HttpStatus.FORBIDDEN);
    }

    const dispute = await this._disputeRepository.findActiveDisputeByWorklog(
      worklog._id.toString(),
    );
    const disputeRaisedBy = dispute ? dispute.raisedBy : undefined;

    return mapWorklogToDetailDTO(worklog, disputeRaisedBy);
  }

  async checkWorklogValidation(
    freelancerId: string,
    contractId: string,
  ): Promise<WorklogValidationResponseDTO> {
    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
    );

    if (!contract) {
      throw new AppError('Contract not found or unauthorized', HttpStatus.NOT_FOUND);
    }

    if (contract.status === 'held') {
      return {
        canLogWork: false,
        reason:
          'Contract is currently on hold. You cannot log work until the contract is reactivated.',
        contractStatus: contract.status,
      };
    }

    if (contract.paymentType === 'hourly' && contract.estimatedHoursPerWeek) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + diffToMonday);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weeklyHoursWorked = await this._worklogRepository.getWeeklyHoursWorked(
        contractId,
        freelancerId,
        weekStart,
        weekEnd,
      );

      if (weeklyHoursWorked >= contract.estimatedHoursPerWeek) {
        return {
          canLogWork: false,
          reason:
            'You have already worked the estimated hours for this week. Please wait for the next week to log more hours.',
          weeklyHoursWorked,
          estimatedHoursPerWeek: contract.estimatedHoursPerWeek,
          contractStatus: contract.status,
        };
      }

      return {
        canLogWork: true,
        weeklyHoursWorked,
        estimatedHoursPerWeek: contract.estimatedHoursPerWeek,
        contractStatus: contract.status,
      };
    }

    if (contract.status !== 'active') {
      return {
        canLogWork: false,
        reason: 'Contract must be active to log work.',
        contractStatus: contract.status,
      };
    }

    return {
      canLogWork: true,
      contractStatus: contract.status,
    };
  }

  async raiseWorklogDispute(
    freelancerId: string,
    contractId: string,
    data: RaiseWorklogDisputeDTO,
  ): Promise<DisputeResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
    );

    if (!contract) {
      throw new AppError('Contract not found or unauthorized', HttpStatus.NOT_FOUND);
    }

    const worklog = await this._worklogRepository.getWorklogById(data.worklogId);

    if (!worklog) {
      throw new AppError('Worklog not found', HttpStatus.NOT_FOUND);
    }

    if (worklog.contractId.toString() !== contractId) {
      throw new AppError('Worklog does not belong to this contract', HttpStatus.FORBIDDEN);
    }

    if (worklog.freelancerId.toString() !== freelancerId) {
      throw new AppError('Unauthorized access to worklog', HttpStatus.FORBIDDEN);
    }

    if (worklog.status !== 'rejected') {
      throw new AppError(ERROR_MESSAGES.DISPUTE.WORKLOG_NOT_REJECTED, HttpStatus.BAD_REQUEST);
    }

    if (!worklog.disputeWindowEndDate || new Date() > worklog.disputeWindowEndDate) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.DISPUTE_WINDOW_EXPIRED, HttpStatus.BAD_REQUEST);
    }

    const existingDispute = await this._disputeRepository.findActiveDisputeByWorklog(
      worklog._id.toString(),
    );
    if (existingDispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.WORKLOG_DISPUTE_EXISTS, HttpStatus.CONFLICT);
    }

    const dispute = await this._disputeRepository.createDispute({
      contractId: new Types.ObjectId(contractId),
      raisedBy: 'freelancer',
      scope: 'worklog',
      scopeId: new Types.ObjectId(worklog._id),
      contractType: contract.paymentType,
      reasonCode: DISPUTE_REASONS.WORKLOG_UNFAIR_REJECTION,
      description: data.description,
      status: 'open',
    });

    await this._contractTransactionRepository.updateTransactionStatusByWorklogId(
      worklog._id.toString(),
      'frozen_dispute',
    );

    return mapDisputeToResponseDTO(dispute);
  }
}
