import { injectable, inject } from 'tsyringe';
import mongoose, { Types } from 'mongoose';
import { IClientWorklogService } from './interfaces/client-worklog-service.interface';
import { IWorklogRepository } from '../../repositories/interfaces/worklog-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import {
  ClientWorklogQueryParamsDTO,
  ClientWorklogListResultDTO,
  ClientWorklogDetailDTO,
  ApproveWorklogDTO,
  RejectWorklogDTO,
} from '../../dto/clientDTO/client-worklog.dto';
import {
  mapWorklogToListItemDTO,
  mapWorklogToDetailDTO,
} from '../../mapper/clientMapper/client-worklog.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { IClientWalletRepository } from '../../repositories/interfaces/client-wallet-repository.interface';
import { IFreelancerWalletRepository } from '../../repositories/interfaces/freelancer-wallet-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { IDisputeRepository } from '../../repositories/interfaces/dispute-repository.interface';
import { COMMISSION_CONFIG } from '../../config/commission.config';

@injectable()
export class ClientWorklogService implements IClientWorklogService {
  constructor(
    @inject('IWorklogRepository') private worklogRepository: IWorklogRepository,
    @inject('IContractRepository') private contractRepository: IContractRepository,
    @inject('IContractTransactionRepository') private _contractTransactionRepository: IContractTransactionRepository,
    @inject('IClientWalletRepository') private _clientWalletRepository: IClientWalletRepository,
    @inject('IFreelancerWalletRepository') private _freelancerWalletRepository: IFreelancerWalletRepository,
    @inject('IUserRepository') private _userRepository: IUserRepository,
    @inject('IDisputeRepository') private _disputeRepository: IDisputeRepository,
  ) {}

  async getWorklogsByContract(
    clientId: string,
    contractId: string,
    query: ClientWorklogQueryParamsDTO,
  ): Promise<ClientWorklogListResultDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid client ID', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contract ID', HttpStatus.BAD_REQUEST);
    }

    const contract = await this.contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError('Unauthorized access to contract', HttpStatus.FORBIDDEN);
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const [worklogs, total] = await Promise.all([
      this.worklogRepository.getWorklogsByContractWithPagination(
        contractId,
        page,
        limit,
        query.status,
      ),
      this.worklogRepository.countWorklogsByContract(contractId, query.status),
    ]);

    const items = worklogs.map(mapWorklogToListItemDTO);

    return {
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getWorklogDetail(
    clientId: string,
    contractId: string,
    worklogId: string,
  ): Promise<ClientWorklogDetailDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid client ID', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contract ID', HttpStatus.BAD_REQUEST);
    }

    const contract = await this.contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError('Unauthorized access to contract', HttpStatus.FORBIDDEN);
    }

    const worklog = await this.worklogRepository.getWorklogById(worklogId);

    if (!worklog) {
      throw new AppError('Worklog not found', HttpStatus.NOT_FOUND);
    }

    if (worklog.contractId.toString() !== contractId) {
      throw new AppError('Worklog does not belong to this contract', HttpStatus.BAD_REQUEST);
    }

    const freelancerName = (
      worklog.freelancerId as unknown as { firstName?: string; lastName?: string }
    )?.firstName
      ? `${(worklog.freelancerId as unknown as { firstName?: string }).firstName} ${(worklog.freelancerId as unknown as { lastName?: string }).lastName || ''}`
      : '';

    const dispute = await this._disputeRepository.findActiveDisputeByWorklog(worklog._id.toString());
    const disputeRaisedBy = dispute ? dispute.raisedBy : undefined;

    return mapWorklogToDetailDTO({ ...worklog.toObject(), freelancerName }, disputeRaisedBy);
  }

  async approveWorklog(
    clientId: string,
    contractId: string,
    data: ApproveWorklogDTO,
  ): Promise<ClientWorklogDetailDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid client ID', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contract ID', HttpStatus.BAD_REQUEST);
    }

    const contract = await this.contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError('Unauthorized access to contract', HttpStatus.FORBIDDEN);
    }

    const worklog = await this.worklogRepository.getWorklogById(data.worklogId);

    if (!worklog) {
      throw new AppError('Worklog not found', HttpStatus.NOT_FOUND);
    }

    if (worklog.contractId.toString() !== contractId) {
      throw new AppError('Worklog does not belong to this contract', HttpStatus.BAD_REQUEST);
    }

    if (worklog.status !== 'submitted') {
      throw new AppError('Only submitted worklogs can be approved', HttpStatus.BAD_REQUEST);
    }

    const updatedWorklog = await this.worklogRepository.updateWorklogStatus(
      data.worklogId,
      'approved',
      data.message,
    );

    if (!updatedWorklog) {
      throw new AppError('Failed to approve worklog', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const freelancerName = (
      updatedWorklog.freelancerId as unknown as { firstName?: string; lastName?: string }
    )?.firstName
      ? `${(updatedWorklog.freelancerId as unknown as { firstName?: string }).firstName} ${(updatedWorklog.freelancerId as unknown as { lastName?: string }).lastName || ''}`
      : '';

    return mapWorklogToDetailDTO({ ...updatedWorklog.toObject(), freelancerName });
  }

  async rejectWorklog(
    clientId: string,
    contractId: string,
    data: RejectWorklogDTO,
  ): Promise<ClientWorklogDetailDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid client ID', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contract ID', HttpStatus.BAD_REQUEST);
    }

    if (!data.message || data.message.trim().length === 0) {
      throw new AppError('Rejection message is required', HttpStatus.BAD_REQUEST);
    }

    const contract = await this.contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError('Unauthorized access to contract', HttpStatus.FORBIDDEN);
    }

    const worklog = await this.worklogRepository.getWorklogById(data.worklogId);

    if (!worklog) {
      throw new AppError('Worklog not found', HttpStatus.NOT_FOUND);
    }

    if (worklog.contractId.toString() !== contractId) {
      throw new AppError('Worklog does not belong to this contract', HttpStatus.BAD_REQUEST);
    }

    if (worklog.status !== 'submitted') {
      throw new AppError('Only submitted worklogs can be rejected', HttpStatus.BAD_REQUEST);
    }

    const updatedWorklog = await this.worklogRepository.updateWorklogStatus(
      data.worklogId,
      'rejected',
      data.message,
    );

    await this.worklogRepository.updateDisputeWindowEndDate(
      data.worklogId,
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) 
    );

    if (!updatedWorklog) {
      throw new AppError('Failed to reject worklog', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const freelancerName = (
      updatedWorklog.freelancerId as unknown as { firstName?: string; lastName?: string }
    )?.firstName
      ? `${(updatedWorklog.freelancerId as unknown as { firstName?: string }).firstName} ${(updatedWorklog.freelancerId as unknown as { lastName?: string }).lastName || ''}`
      : '';

    return mapWorklogToDetailDTO({ ...updatedWorklog.toObject(), freelancerName });
  }

  async autoPayWorkLog(): Promise<void> {
    const workLogsToPay = await this.worklogRepository.getWorklogsForAutoPay();
    for (const worklog of workLogsToPay) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        
        await this.worklogRepository.updateWorklogStatus(worklog.worklogId, 'paid', '', session);
        const contract = await this.contractRepository.findById(
          worklog.contractId.toString(),
          session,
        );
        
        if (!contract) {
          throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
        }
        
        const contractHourlyRate = contract.hourlyRate || 0;
        const hoursWorked = worklog.duration / (1000 * 60 * 60);
        const amountToRelease = contractHourlyRate * hoursWorked;

        // Find funding transaction for this contract
        const heldTransactions = await this._contractTransactionRepository.findByContractId(contract._id?.toString() || '');
        const fundingTransaction = heldTransactions.find(t => t.purpose === 'hold' && t.status === 'active_hold' && t.workLogId?.toString() === worklog._id?.toString());
        
        if (!fundingTransaction) {
          throw new AppError('No funding transaction found', HttpStatus.BAD_REQUEST);
        }

        const paymentAmount = amountToRelease;
        const commission = Math.round(paymentAmount * COMMISSION_CONFIG.PLATFORM_COMMISSION_RATE); // 15% commission
        const freelancerAmount = paymentAmount - commission;

        await this._contractTransactionRepository.updateTransactionStatusForWorklog(
         worklog._id!.toString(),
          'released_to_freelancer',
          session,
        );

        // Create release transaction
        await this._contractTransactionRepository.createTransaction({
          contractId: new Types.ObjectId(worklog.contractId),
          paymentId: fundingTransaction.paymentId,
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
          amount: paymentAmount,
          purpose: 'release',
          description: `Payment for approved worklog - ${worklog.worklogId}`,
        }, session);

        // Create commission transaction
        await this._contractTransactionRepository.createTransaction({
          contractId: new Types.ObjectId(worklog.contractId),
          paymentId: fundingTransaction.paymentId,
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
          amount: commission,
          purpose: 'commission',
          description: `Platform commission (${COMMISSION_CONFIG.PLATFORM_COMMISSION_RATE * 100}%) for worklog`,
        }, session);

        // Update client wallet
        await this._clientWalletRepository.updateBalance(
          contract.clientId.toString(),
          -paymentAmount,
          session,
        );

        // Update or create freelancer wallet
        const existingFreelancerWallet = await this._freelancerWalletRepository.findByFreelancerId(
          contract.freelancerId.toString(),
        );

        if (existingFreelancerWallet) {
          await this._freelancerWalletRepository.updateBalance(
            contract.freelancerId.toString(),
            freelancerAmount,
            session,
          );
          await this._freelancerWalletRepository.incrementTotalEarned(
            contract.freelancerId.toString(),
            freelancerAmount,
            session,
          );
          await this._freelancerWalletRepository.incrementTotalCommissionPaid(
            contract.freelancerId.toString(),
            commission,
            session,
          );
        } else {
          await this._freelancerWalletRepository.createWallet(
            contract.freelancerId.toString(),
            session,
          );
          await this._freelancerWalletRepository.updateBalance(
            contract.freelancerId.toString(),
            freelancerAmount,
            session,
          );
          await this._freelancerWalletRepository.incrementTotalEarned(
            contract.freelancerId.toString(),
            freelancerAmount,
            session,
          );
          await this._freelancerWalletRepository.incrementTotalCommissionPaid(
            contract.freelancerId.toString(),
            commission,
            session,
          );
        }

        await this._userRepository.updateWalletBalance(
          contract.freelancerId.toString(),
          freelancerAmount,
        );

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        console.error(`Failed to auto-pay worklog ${worklog.worklogId}:`, error);
      } finally {
        session.endSession();
      }
    }
  }
}
