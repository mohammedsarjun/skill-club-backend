import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientContractService } from './interfaces/client-contract-service.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import {
  ClientContractDetailDTO,
  ClientContractListResultDTO,
  ClientContractQueryParamsDTO,
} from '../../dto/clientDTO/client-contract.dto';
import {
  DeliverableResponseDTO,
  ApproveDeliverableDTO,
  RequestChangesDTO,
} from '../../dto/clientDTO/client-deliverable.dto';
import {
  ApproveMilestoneDeliverableDTO,
  RequestMilestoneChangesDTO,
  RespondToExtensionDTO,
  MilestoneDeliverableResponseDTO,
  MilestoneExtensionResponseDTO,
  ClientMilestonesDetailDTO,
} from '../../dto/clientDTO/client-milestone.dto';
import {
  RespondToContractExtensionDTO,
  ContractExtensionResponseDTO,
} from '../../dto/clientDTO/client-contract-extension.dto';
import { CreateCancellationRequestDTO, CancellationRequestResponseDTO } from '../../dto/clientDTO/client-cancellation-request.dto';
import { AcceptCancellationRequestDTO } from '../../dto/clientDTO/client-accept-cancellation-request.dto';
import { mapContractModelToClientContractDetailDTO } from '../../mapper/clientMapper/client-contract.mapper';
import { mapContractModelToClientContractListItemDTO } from '../../mapper/clientMapper/client-contract-list.mapper';
import { ClientDeliverableMapper } from '../../mapper/clientMapper/client-deliverable.mapper';
import { ClientMilestoneMapper } from '../../mapper/clientMapper/client-milestone.mapper';
import { ClientContractExtensionMapper } from '../../mapper/clientMapper/client-contract-extension.mapper';
import { toCancellationRequestResponseDTO } from '../../mapper/clientMapper/client-cancellation-request.mapper';
import { isHourlyContractBalanceSufficient } from '../../mapper/clientMapper/client-hourly-contract.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { Types } from 'mongoose';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { IClientWalletRepository } from '../../repositories/interfaces/client-wallet-repository.interface';
import { IFreelancerWalletRepository } from '../../repositories/interfaces/freelancer-wallet-repository.interface';
import { IMeetingRepository } from '../../repositories/interfaces/meeting-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { COMMISSION_CONFIG } from '../../config/commission.config';
import { IContract, ContractDeliverable } from '../../models/interfaces/contract.model.interface';
import { IFileDownloadService } from '../commonServices/interfaces/file-download-service.interface';
import { DownloadDeliverableDTO } from '../../dto/clientDTO/client-deliverable.dto';
import { FileDownloadInput } from '../../dto/files-download.dto';
import archiver from 'archiver';
import { DeliverableChangeStrategyFactory } from './factories/deliverableFactories/DeliverableChangeStrategyFactory';
import { ContractCancellationStrategyFactory } from './factories/cancellationFactories/ContractCancellationStrategyFactory';
import { IWorklogRepository } from '../../repositories/interfaces/worklog-repository.interface';
import { IContractTransaction } from 'src/models/interfaces/contract-transaction.model.interface';
import { ICancellationRequestRepository } from '../../repositories/interfaces/cancellation-request-repository.interface';
import { IDisputeRepository } from 'src/repositories/interfaces/dispute-repository.interface';

@injectable()
export class ClientContractService implements IClientContractService {
  private _contractRepository: IContractRepository;
  private _contractTransactionRepository: IContractTransactionRepository;
  private _clientWalletRepository: IClientWalletRepository;
  private _freelancerWalletRepository: IFreelancerWalletRepository;
  private _userRepository: IUserRepository;
  private _meetingRepository: IMeetingRepository;
  private _fileDownloadService: IFileDownloadService;
  private _worklogRepository: IWorklogRepository;
  private _deliverableChangeStrategyFactory: DeliverableChangeStrategyFactory;
  private _cancellationStrategyFactory: ContractCancellationStrategyFactory;
  private _cancellationRequestRepository: ICancellationRequestRepository;
  private _disputeRepository: IDisputeRepository;

  constructor(
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
    @inject('IClientWalletRepository') clientWalletRepository: IClientWalletRepository,
    @inject('IFreelancerWalletRepository') freelancerWalletRepository: IFreelancerWalletRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
    @inject('IMeetingRepository') meetingRepository: IMeetingRepository,
    @inject('IFileDownloadService') fileDownloadService: IFileDownloadService,
    @inject('IWorklogRepository') worklogRepository: IWorklogRepository,
    @inject('DeliverableChangeStrategyFactory')
    deliverableChangeStrategyFactory: DeliverableChangeStrategyFactory,
    @inject('ContractCancellationStrategyFactory')
    cancellationStrategyFactory: ContractCancellationStrategyFactory,
    @inject('ICancellationRequestRepository') cancellationRequestRepository: ICancellationRequestRepository,
    @inject('IDisputeRepository') disputeRepository: IDisputeRepository,
  ) {
    this._contractRepository = contractRepository;
    this._contractTransactionRepository = contractTransactionRepository;
    this._clientWalletRepository = clientWalletRepository;
    this._freelancerWalletRepository = freelancerWalletRepository;
    this._userRepository = userRepository;
    this._meetingRepository = meetingRepository;
    this._fileDownloadService = fileDownloadService;
    this._worklogRepository = worklogRepository;
    this._deliverableChangeStrategyFactory = deliverableChangeStrategyFactory;
    this._cancellationStrategyFactory = cancellationStrategyFactory;
    this._cancellationRequestRepository = cancellationRequestRepository;
    this._disputeRepository = disputeRepository;
  }

  async getContractDetail(clientId: string, contractId: string): Promise<ClientContractDetailDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findContractDetailByIdForClient(
      contractId,
      clientId,
    );

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    const financialSummary =
      await this._contractTransactionRepository.findFinancialSummaryByContractId(contractId);

    const dto = mapContractModelToClientContractDetailDTO(contract, financialSummary);
    if (dto.deliverables && dto.deliverables.length > 0) {
      const checks = await Promise.all(
        dto.deliverables.map((_d) =>
          this._meetingRepository.isMeetingAlreadyProposed(contract._id?.toString() || ''),
        ),
      );

      dto.deliverables = dto.deliverables.map((d, i) => ({
        ...d,
        isMeetingProposalSent: !!checks[i],
      }));
    }

    return dto;
  }

  async cancelContract(
    clientId: string,
    contractId: string,
    cancelContractReason: string,
  ): Promise<{ cancelled: boolean; requiresDispute: boolean }> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findContractDetailByIdForClient(
      contractId,
      clientId,
    );

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.status === 'cancelled') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.ALREADY_CANCELLED, HttpStatus.BAD_REQUEST);
    }

    if (contract.status === 'refunded') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.CANCELLATION_IN_PROGRESS, HttpStatus.BAD_REQUEST);
    }

    await this._contractRepository.cancelContractByUser(contractId, 'client', cancelContractReason);

    // Segregate cancellation logic by payment type
    const paymentType = contract.paymentType;

    switch (paymentType) {
      case 'fixed':
        return await this.cancelFixedContract(contract, contractId, cancelContractReason);

      case 'fixed_with_milestones':
        return await this.cancelFixedWithMilestonesContract(
          contract,
          contractId,
          cancelContractReason,
        );

      case 'hourly':
        return await this.cancelHourlyContract(contract, contractId, cancelContractReason);

      default:
        throw new AppError('Invalid contract type', HttpStatus.BAD_REQUEST);
    }
  }

  private async cancelFixedContract(
    contract: IContract,
    contractId: string,
    cancelContractReason: string,
  ): Promise<{ cancelled: boolean; requiresDispute: boolean }> {
    const paymentType = contract.paymentType || '';
    const strategy = this._cancellationStrategyFactory.getStrategy(paymentType);

    const totalFunded =
      await this._contractTransactionRepository.findTotalFundedAmountForFixedContract(contractId);

    const cancellationResult = strategy.processCancellation(contract, totalFunded);

    await this._contractRepository.cancelContractByUser(contractId, 'client', cancelContractReason);
    if (contract?.isFunded) {
      const hasDeliverables = await this._contractRepository.hasAnyDeliverables(contractId);
      if (hasDeliverables) {
      } else {
        const refundTransaction: Partial<IContractTransaction> = {
          contractId: new Types.ObjectId(contractId),
          amount: cancellationResult.refundAmount,
          purpose: 'refund',
          description: 'Full refund for cancelled contract',
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
        };

        await this._contractTransactionRepository.createTransaction(refundTransaction);
        await this._contractTransactionRepository.updateTransactionStatusForFixedContract(
          contractId,
          'refunded_back_to_client',
        );
      }
      return { cancelled: true, requiresDispute: false };
    }

    return { cancelled: true, requiresDispute: false };
  }

  private async cancelFixedWithMilestonesContract(
    contract: IContract,
    contractId: string,
    cancelContractReason: string,
  ): Promise<{ cancelled: boolean; requiresDispute: boolean }> {
    const isClientFundedForAtLeastOneMilestone = contract?.milestones?.some(
      (milestone) => milestone.isFunded == true,
    );

    if (!isClientFundedForAtLeastOneMilestone) {
      await this._contractRepository.cancelContractByUser(
        contractId,
        'client',
        cancelContractReason,
      );
      await this._contractRepository.markAllMilestonesAsCancelled(contractId);
      return { cancelled: true, requiresDispute: false };
    }

    const hasSubmittedMilestoneDeliverables = contract.milestones?.some(
      (milestone) => milestone.deliverables && milestone.deliverables.length > 0,
    );

    if (!hasSubmittedMilestoneDeliverables) {
      await this._contractRepository.cancelContractByUser(
        contractId,
        'client',
        cancelContractReason,
      );

      const fundedMilestones = contract.milestones?.filter(
        (milestone) => milestone.isFunded === true,
      );

      for (const milestone of fundedMilestones || []) {
        const refundAmount =
          await this._contractTransactionRepository.findTotalFundedAmountForMilestone(
            contractId,
            milestone._id?.toString()!,
          );
        const refundTransaction: Partial<IContractTransaction> = {
          contractId: new Types.ObjectId(contractId),
          milestoneId: new Types.ObjectId(milestone._id?.toString()),
          amount: refundAmount,
          purpose: 'refund',
          description: `Refund for milestone: ${milestone.title} due to contract cancellation`,
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
        };

        await this._contractTransactionRepository.createTransaction(refundTransaction);

        await this._contractTransactionRepository.updateTransactionStatusForMilestoneContract(
          contractId,
          milestone._id?.toString()!,
          'refunded_back_to_client',
        );

        await this._contractRepository.markMilestoneAsCancelled(
          contractId,
          milestone._id?.toString()!,
        );
      }

      const unpaidMilestones = contract.milestones?.filter(
        (milestone) => milestone.status == 'pending_funding',
      );

      for (const unpaidMilestone of unpaidMilestones || []) {
        await this._contractRepository.markMilestoneAsCancelled(
          contractId,
          unpaidMilestone._id?.toString()!,
        );
      }

      return { cancelled: true, requiresDispute: false };
    }

    return { cancelled: false, requiresDispute: true };
  }

  private async cancelHourlyContract(
    _contract: IContract,
    _contractId: string,
    _cancelContractReason: string,
  ): Promise<{ cancelled: boolean; requiresDispute: boolean }> {
    // TODO: Implement hourly-specific cancellation logic
    // Handle work logs, hourly billing, etc.

    throw new AppError(
      'Hourly contract cancellation not yet implemented',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async getAllContracts(
    clientId: string,
    query: ClientContractQueryParamsDTO,
  ): Promise<ClientContractListResultDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    const normalizedQuery: ClientContractQueryParamsDTO = {
      search: query.search,
      page: query.page && query.page > 0 ? query.page : 1,
      limit: query.limit && query.limit > 0 ? query.limit : 10,
      filters: query.filters || {},
    };

    const [contracts, total] = await Promise.all([
      this._contractRepository.findAllForClient(clientId, normalizedQuery),
      this._contractRepository.countForClient(clientId, normalizedQuery),
    ]);

    const items = contracts.map(mapContractModelToClientContractListItemDTO);

    return {
      items,
      page: normalizedQuery.page!,
      limit: normalizedQuery.limit!,
      total,
      pages: Math.ceil(total / normalizedQuery.limit!),
    };
  }

  private async approveDeliverableInternal(
    contract: IContract,
    deliverable: ContractDeliverable,
    message: string,
  ): Promise<DeliverableResponseDTO> {
    // Find the held contract transaction for this contract
    const heldTransactions = await this._contractTransactionRepository.findByContractId(
      contract._id?.toString() || '',
    );
    const fundingTransaction = heldTransactions.find((t) => t.purpose === 'funding');
    if (!fundingTransaction)
      throw new AppError('No funding transaction found', HttpStatus.BAD_REQUEST);

    const paymentAmount = fundingTransaction.amount;
    const commission = Math.round(paymentAmount * COMMISSION_CONFIG.PLATFORM_COMMISSION_RATE); // 15% commission
    const freelancerAmount = paymentAmount - commission;

    // Create release transaction for the full payment amount
    await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(contract._id?.toString() || ''),
      paymentId: fundingTransaction.paymentId,
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
      amount: paymentAmount,
      purpose: 'release',
      description: `Payment release for approved deliverable - ${contract.title}`,
    });

    await this._contractTransactionRepository.updateTransactionStatusForFixedContract(
      contract._id?.toString() || '',
      'released_to_freelancer',
    );

    // Create commission transaction
    await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(contract._id?.toString() || ''),
      paymentId: fundingTransaction.paymentId,
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
      amount: commission,
      purpose: 'commission',
      description: `Platform commission (${COMMISSION_CONFIG.PLATFORM_COMMISSION_RATE * 100}%) for contract - ${contract.title}`,
    });

    // Update client wallet - deduct the funded amount
    await this._clientWalletRepository.updateBalance(contract.clientId.toString(), -paymentAmount);

    // Update or create freelancer wallet
    const existingFreelancerWallet = await this._freelancerWalletRepository.findByFreelancerId(
      contract.freelancerId.toString(),
    );

    if (existingFreelancerWallet) {
      await this._freelancerWalletRepository.updateBalance(
        contract.freelancerId.toString(),
        freelancerAmount,
      );
      await this._freelancerWalletRepository.incrementTotalEarned(
        contract.freelancerId.toString(),
        freelancerAmount,
      );
      await this._freelancerWalletRepository.incrementTotalCommissionPaid(
        contract.freelancerId.toString(),
        commission,
      );
    } else {
      await this._freelancerWalletRepository.createWallet(contract.freelancerId.toString());
      await this._freelancerWalletRepository.updateBalance(
        contract.freelancerId.toString(),
        freelancerAmount,
      );
      await this._freelancerWalletRepository.incrementTotalEarned(
        contract.freelancerId.toString(),
        freelancerAmount,
      );
      await this._freelancerWalletRepository.incrementTotalCommissionPaid(
        contract.freelancerId.toString(),
        commission,
      );
    }

    // Update freelancer's user wallet balance (for display in their account)
    const freelancer = await this._userRepository.updateWalletBalance(
      contract.freelancerId.toString(),
      freelancerAmount,
    );
    if (!freelancer) throw new AppError('Freelancer not found', HttpStatus.NOT_FOUND);

    const updatedContract = await this._contractRepository.approveDeliverable(
      contract._id?.toString() || '',
      deliverable._id?.toString() || '',
      message,
    );
    if (!updatedContract)
      throw new AppError('Failed to approve deliverable', HttpStatus.INTERNAL_SERVER_ERROR);

    const newTotalPaid = (updatedContract.totalPaid || 0) + paymentAmount;
    const newBalance = (updatedContract.fundedAmount || 0) - newTotalPaid;
    const finalContract = await this._contractRepository.updateContractPayment(
      contract._id?.toString() || '',
      newTotalPaid,
      newBalance,
    );

    if (contract.paymentType === 'fixed' || contract.paymentType === 'fixed_with_milestones') {
      const remainingFundingTransactions =
        await this._contractTransactionRepository.findByContractId(contract._id?.toString() || '');
      const hasRemainingFunding = remainingFundingTransactions.some(
        (t) => t.purpose === 'funding' && t.transactionId !== fundingTransaction.transactionId,
      );
      if (!hasRemainingFunding)
        await this._contractRepository.markContractAsCompleted(contract._id?.toString() || '');
    }

    if (!finalContract)
      throw new AppError('Failed to update contract', HttpStatus.INTERNAL_SERVER_ERROR);
    const approvedDeliverable = finalContract.deliverables?.find(
      (d) => d._id?.toString() === deliverable._id?.toString(),
    );
    if (!approvedDeliverable)
      throw new AppError(
        'Failed to retrieve approved deliverable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return {
      id: approvedDeliverable._id?.toString() || '',
      submittedBy: approvedDeliverable.submittedBy.toString(),
      files: approvedDeliverable.files,
      message: approvedDeliverable.message,
      status: approvedDeliverable.status,
      version: approvedDeliverable.version,
      submittedAt: approvedDeliverable.submittedAt.toISOString(),
      approvedAt: approvedDeliverable.approvedAt?.toISOString(),
      revisionsRequested: approvedDeliverable.revisionsRequested,
    };
  }

  async approveDeliverable(
    clientId: string,
    contractId: string,
    data: ApproveDeliverableDTO,
  ): Promise<DeliverableResponseDTO> {
    if (!Types.ObjectId.isValid(clientId))
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    if (!Types.ObjectId.isValid(contractId))
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    if (!Types.ObjectId.isValid(data.deliverableId))
      throw new AppError('Invalid deliverableId', HttpStatus.BAD_REQUEST);

    const contract = await this._contractRepository.findById(contractId);
    if (!contract) throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    if (contract.clientId.toString() !== clientId)
      throw new AppError('Unauthorized', HttpStatus.FORBIDDEN);
    if (contract.status !== 'active')
      throw new AppError('Contract must be active', HttpStatus.BAD_REQUEST);

    const deliverable = contract.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );
    if (!deliverable) throw new AppError('Deliverable not found', HttpStatus.NOT_FOUND);
    if (deliverable.status === 'approved')
      throw new AppError('Deliverable already approved', HttpStatus.BAD_REQUEST);

    return this.approveDeliverableInternal(
      contract,
      deliverable,
      data.message || 'Approved by client',
    );
  }

  async autoApprovePendingDeliverables(): Promise<void> {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const contracts =
      await this._contractRepository.findContractsWithPendingDeliverables(threeDaysAgo);

    for (const contract of contracts) {
      const pendingDeliverables =
        contract.deliverables?.filter(
          (d: any) => d.status === 'submitted' && new Date(d.submittedAt) <= threeDaysAgo,
        ) || [];
      for (const deliverable of pendingDeliverables) {
        try {
          await this.approveDeliverableInternal(contract, deliverable, 'Auto-approved by system');
        } catch (error) {
          console.error(
            `Failed to auto-approve deliverable ${deliverable._id?.toString()} for contract ${contract._id?.toString()}:`,
            error,
          );
        }
      }
    }
  }

  async requestDeliverableChanges(
    clientId: string,
    contractId: string,
    data: RequestChangesDTO,
  ): Promise<DeliverableResponseDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.deliverableId)) {
      throw new AppError('Invalid deliverableId', HttpStatus.BAD_REQUEST);
    }

    if (!data.message || data.message.trim().length === 0) {
      throw new AppError('Message is required when requesting changes', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(
        'You are not authorized to request changes for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    if (contract.status !== 'active') {
      throw new AppError('Contract must be active to request changes', HttpStatus.BAD_REQUEST);
    }

    // if(contract.remainingRevisions !== undefined && contract.remainingRevisions <= 0) {
    //   throw new AppError('No remaining revisions allowed for this contract', HttpStatus.BAD_REQUEST);
    // }

    const deliverable = contract.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );

    if (!deliverable) {
      throw new AppError('Deliverable not found', HttpStatus.NOT_FOUND);
    }

    if (deliverable.status === 'approved') {
      throw new AppError(
        'Cannot request changes for an approved deliverable',
        HttpStatus.BAD_REQUEST,
      );
    }

    const strategy = this._deliverableChangeStrategyFactory.getStrategy(contract.paymentType || '');

    const allowedRevisions = strategy.getAllowedRevisions(contract, deliverable) || 0;

    if (allowedRevisions <= 0) {
      throw new AppError('Revision limit reached for this deliverable', HttpStatus.BAD_REQUEST);
    }

    const updatedContract = await this._contractRepository.requestDeliverableChanges(
      contractId,
      data.deliverableId,
      data.message,
      undefined,
      contract.paymentType,
    );

    if (!updatedContract) {
      throw new AppError('Failed to request changes', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const changedDeliverable = updatedContract.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );

    if (!changedDeliverable) {
      throw new AppError(
        'Failed to retrieve updated deliverable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ClientDeliverableMapper.toDeliverableResponseDTO(changedDeliverable, updatedContract);
  }

  async approveMilestoneDeliverable(
    clientId: string,
    contractId: string,
    data: ApproveMilestoneDeliverableDTO,
  ): Promise<MilestoneDeliverableResponseDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.milestoneId)) {
      throw new AppError('Invalid milestoneId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.deliverableId)) {
      throw new AppError('Invalid deliverableId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(
        'You are not authorized to approve deliverables for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    if (contract.status !== 'active') {
      throw new AppError('Contract must be active to approve deliverables', HttpStatus.BAD_REQUEST);
    }

    const milestone = contract.milestones?.find((m) => m._id?.toString() === data.milestoneId);

    if (!milestone) {
      throw new AppError('Milestone not found', HttpStatus.NOT_FOUND);
    }

    const deliverable = milestone.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );

    if (!deliverable) {
      throw new AppError('Deliverable not found', HttpStatus.NOT_FOUND);
    }

    if (deliverable.status === 'approved') {
      throw new AppError('Deliverable already approved', HttpStatus.BAD_REQUEST);
    }

    // Find the held contract transaction for this milestone
    const heldTransactions = await this._contractTransactionRepository.findByContractId(contractId);
    const fundingTransaction = heldTransactions.find(
      (t) => t.purpose === 'funding' && t.milestoneId?.toString() === data.milestoneId,
    );

    if (!fundingTransaction) {
      throw new AppError('No funding transaction found for this milestone', HttpStatus.BAD_REQUEST);
    }

    const paymentAmount = fundingTransaction.amount;
    const commission = Math.round(paymentAmount * COMMISSION_CONFIG.PLATFORM_COMMISSION_RATE); // 15% commission
    const freelancerAmount = paymentAmount - commission;

    // Create release transaction for the full payment amount
    await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(contractId),
      paymentId: fundingTransaction.paymentId,
      milestoneId: new Types.ObjectId(data.milestoneId),
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
      amount: paymentAmount,
      purpose: 'release',
      description: `Payment release for approved milestone - ${milestone.title}`,
    });

    // Create commission transaction
    await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(contractId),
      paymentId: fundingTransaction.paymentId,
      milestoneId: new Types.ObjectId(data.milestoneId),
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
      amount: commission,
      purpose: 'commission',
      description: `Platform commission (${COMMISSION_CONFIG.PLATFORM_COMMISSION_RATE * 100}%) for milestone - ${milestone.title}`,
    });

    await this._contractTransactionRepository.updateTransactionStatusForMilestoneContract(
      contractId,
      data.milestoneId,
      'released_to_freelancer',
    );

    // Update client wallet - deduct the funded amount
    await this._clientWalletRepository.updateBalance(contract.clientId.toString(), -paymentAmount);

    // Update or create freelancer wallet
    const existingFreelancerWallet = await this._freelancerWalletRepository.findByFreelancerId(
      contract.freelancerId.toString(),
    );

    if (existingFreelancerWallet) {
      await this._freelancerWalletRepository.updateBalance(
        contract.freelancerId.toString(),
        freelancerAmount,
      );
      await this._freelancerWalletRepository.incrementTotalEarned(
        contract.freelancerId.toString(),
        freelancerAmount,
      );
      await this._freelancerWalletRepository.incrementTotalCommissionPaid(
        contract.freelancerId.toString(),
        commission,
      );
    } else {
      await this._freelancerWalletRepository.createWallet(contract.freelancerId.toString());
      await this._freelancerWalletRepository.updateBalance(
        contract.freelancerId.toString(),
        freelancerAmount,
      );
      await this._freelancerWalletRepository.incrementTotalEarned(
        contract.freelancerId.toString(),
        freelancerAmount,
      );
      await this._freelancerWalletRepository.incrementTotalCommissionPaid(
        contract.freelancerId.toString(),
        commission,
      );
    }

    // Update freelancer's user wallet balance
    const freelancer = await this._userRepository.updateWalletBalance(
      contract.freelancerId.toString(),
      freelancerAmount,
    );
    if (!freelancer) {
      throw new AppError('Freelancer not found', HttpStatus.NOT_FOUND);
    }

    const updatedContract = await this._contractRepository.approveMilestoneDeliverable(
      contractId,
      data.milestoneId,
      data.deliverableId,
      data.message,
    );

    if (!updatedContract) {
      throw new AppError('Failed to approve deliverable', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const newTotalPaid = (updatedContract.totalPaid || 0) + paymentAmount;
    const newBalance = (updatedContract.fundedAmount || 0) - newTotalPaid;
    const finalContract = await this._contractRepository.updateContractPayment(
      contractId,
      newTotalPaid,
      newBalance,
    );

    if (!finalContract) {
      throw new AppError(
        'Failed to update contract payment info',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this._contractRepository.updateMilestoneStatus(contractId, data.milestoneId, 'paid');

    await this._contractRepository.addTimelineEntry(
      contractId,
      'milestone_deliverable_approved',
      clientId,
      data.milestoneId,
      `Milestone approved: ${milestone.title}`,
    );

    if (contract.paymentType === 'fixed_with_milestones') {
      const isAllMilestonesPaid = await this._contractRepository.isAllMilestonesPaid(contractId);

      if (isAllMilestonesPaid) {
        await this._contractRepository.markContractAsCompleted(contractId);
      }
    }

    const updatedMilestone = finalContract.milestones?.find(
      (m) => m._id?.toString() === data.milestoneId,
    );
    const approvedDeliverable = updatedMilestone?.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );

    if (!approvedDeliverable || !updatedMilestone) {
      throw new AppError(
        'Failed to retrieve approved deliverable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ClientMilestoneMapper.toMilestoneDeliverableResponseDTO(
      approvedDeliverable,
      updatedMilestone,
    );
  }

  async requestMilestoneChanges(
    clientId: string,
    contractId: string,
    data: RequestMilestoneChangesDTO,
  ): Promise<MilestoneDeliverableResponseDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.milestoneId)) {
      throw new AppError('Invalid milestoneId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.deliverableId)) {
      throw new AppError('Invalid deliverableId', HttpStatus.BAD_REQUEST);
    }

    if (!data.message || data.message.trim().length === 0) {
      throw new AppError('Change request message is required', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(
        'You are not authorized to request changes for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    if (contract.status !== 'active') {
      throw new AppError('Contract must be active to request changes', HttpStatus.BAD_REQUEST);
    }

    const milestone = contract.milestones?.find((m) => m._id?.toString() === data.milestoneId);

    if (!milestone) {
      throw new AppError('Milestone not found', HttpStatus.NOT_FOUND);
    }

    const deliverable = milestone.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );

    if (!deliverable) {
      throw new AppError('Deliverable not found', HttpStatus.NOT_FOUND);
    }

    const currentRequested = deliverable.revisionsRequested || 0;
    const allowedRevisions = milestone.revisionsAllowed || 0;

    if (currentRequested >= allowedRevisions) {
      throw new AppError('Revision limit reached for this milestone', HttpStatus.BAD_REQUEST);
    }

    const updatedContract = await this._contractRepository.requestMilestoneChanges(
      contractId,
      data.milestoneId,
      data.deliverableId,
      data.message,
    );

    if (!updatedContract) {
      throw new AppError('Failed to request changes', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this._contractRepository.addTimelineEntry(
      contractId,
      'milestone_changes_requested',
      clientId,
      data.milestoneId,
      `Changes requested for milestone: ${milestone.title}`,
    );

    const updatedMilestone = updatedContract.milestones?.find(
      (m) => m._id?.toString() === data.milestoneId,
    );
    const changedDeliverable = updatedMilestone?.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );

    if (!changedDeliverable || !updatedMilestone) {
      throw new AppError(
        'Failed to retrieve updated deliverable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ClientMilestoneMapper.toMilestoneDeliverableResponseDTO(
      changedDeliverable,
      updatedMilestone,
    );
  }

  async respondToMilestoneExtension(
    clientId: string,
    contractId: string,
    data: RespondToExtensionDTO,
  ): Promise<MilestoneExtensionResponseDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.milestoneId)) {
      throw new AppError('Invalid milestoneId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(
        'You are not authorized to respond to extension requests for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    const milestone = contract.milestones?.find((m) => m._id?.toString() === data.milestoneId);

    if (!milestone) {
      throw new AppError('Milestone not found', HttpStatus.NOT_FOUND);
    }

    if (!milestone.extensionRequest || milestone.extensionRequest.status !== 'pending') {
      throw new AppError('No pending extension request found', HttpStatus.BAD_REQUEST);
    }

    const updatedContract = await this._contractRepository.respondToMilestoneExtension(
      contractId,
      data.milestoneId,
      data.approved,
      data.responseMessage,
    );

    if (!updatedContract) {
      throw new AppError(
        'Failed to respond to extension request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const action = data.approved ? 'milestone_extension_approved' : 'milestone_extension_rejected';
    await this._contractRepository.addTimelineEntry(
      contractId,
      action,
      clientId,
      data.milestoneId,
      `Extension ${data.approved ? 'approved' : 'rejected'} for milestone: ${milestone.title}`,
    );

    const updatedMilestone = updatedContract.milestones?.find(
      (m) => m._id?.toString() === data.milestoneId,
    );

    if (!updatedMilestone?.extensionRequest) {
      throw new AppError('Failed to retrieve extension response', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ClientMilestoneMapper.toMilestoneExtensionResponseDTO(updatedMilestone.extensionRequest);
  }

  async getMilestoneDetail(
    clientId: string,
    contractId: string,
    milestoneId: string,
  ): Promise<ClientMilestonesDetailDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(milestoneId)) {
      throw new AppError('Invalid milestoneId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }
    const milestone = contract.milestones?.find((m) => m._id?.toString() === milestoneId);

    if (!milestone) {
      throw new AppError('Milestone not found', HttpStatus.NOT_FOUND);
    }

    return ClientMilestoneMapper.toClientMilestoneDetailDTO(milestone);
  }

  async respondToContractExtension(
    clientId: string,
    contractId: string,
    data: RespondToContractExtensionDTO,
  ): Promise<ContractExtensionResponseDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(
        'You are not authorized to respond to extension for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!contract.extensionRequest || contract.extensionRequest.status !== 'pending') {
      throw new AppError('No pending extension request found', HttpStatus.BAD_REQUEST);
    }

    const updatedContract = await this._contractRepository.respondToContractExtension(
      contractId,
      data.approved,
      data.responseMessage,
    );

    if (!updatedContract) {
      throw new AppError(
        'Failed to respond to extension request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const action = data.approved ? 'contract_extension_approved' : 'contract_extension_rejected';
    await this._contractRepository.addTimelineEntry(
      contractId,
      action,
      clientId,
      undefined,
      `Contract extension ${data.approved ? 'approved' : 'rejected'}`,
    );

    if (!updatedContract.extensionRequest) {
      throw new AppError('Failed to retrieve extension response', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return ClientContractExtensionMapper.toContractExtensionResponseDTO(
      updatedContract.extensionRequest,
    );
  }

  async downloadDeliverableFiles(
    clientId: string,
    contractId: string,
    data: DownloadDeliverableDTO,
  ): Promise<archiver.Archiver> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(
        'You are not authorized to download deliverables for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    const deliverable = contract.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );

    if (!deliverable) {
      throw new AppError('Deliverable not found', HttpStatus.NOT_FOUND);
    }

    if (!deliverable.files || deliverable.files.length === 0) {
      throw new AppError('No files found in this deliverable', HttpStatus.BAD_REQUEST);
    }

    const files: FileDownloadInput[] = deliverable.files.map((file) => ({
      url: file.fileUrl,
      originalName: file.fileName,
    }));

    return this._fileDownloadService.getDeliverablesZip(files);
  }

  async downloadMilestoneDeliverableFiles(
    clientId: string,
    contractId: string,
    milestoneId: string,
    data: DownloadDeliverableDTO,
  ): Promise<archiver.Archiver> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(milestoneId)) {
      throw new AppError('Invalid milestoneId', HttpStatus.BAD_REQUEST);
    }
    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }
    if (contract.clientId.toString() !== clientId) {
      throw new AppError(
        'You are not authorized to download deliverables for this contract',
        HttpStatus.FORBIDDEN,
      );
    }
    const milestone = contract.milestones?.find((m) => m._id?.toString() === milestoneId);

    if (!milestone) {
      throw new AppError('Milestone not found', HttpStatus.NOT_FOUND);
    }

    const deliverable = milestone.deliverables?.find(
      (d) => d._id?.toString() === data.deliverableId,
    );

    if (!deliverable) {
      throw new AppError('Deliverable not found', HttpStatus.NOT_FOUND);
    }

    if (!deliverable.files || deliverable.files.length === 0) {
      throw new AppError('No files found in this deliverable', HttpStatus.BAD_REQUEST);
    }

    const files: FileDownloadInput[] = deliverable.files.map((file) => ({
      url: file.fileUrl,
      originalName: file.fileName,
    }));

    return this._fileDownloadService.getDeliverablesZip(files);
  }

  async activateHourlyContract(
    clientId: string,
    contractId: string,
  ): Promise<{ activated: boolean }> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    if (contract.paymentType !== 'hourly') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_HOURLY, HttpStatus.BAD_REQUEST);
    }

    if (contract.status !== 'held') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.INVALID_ACTIVATION, HttpStatus.BAD_REQUEST);
    }

    if (!isHourlyContractBalanceSufficient(contract)) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.INSUFFICIENT_BALANCE, HttpStatus.BAD_REQUEST);
    }

    await this._contractRepository.activateHourlyContract(contractId);

    return { activated: true };
  }

  async endHourlyContract(
    clientId: string,
    contractId: string,
  ): Promise<{ ended: boolean; message: string }> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findContractDetailByIdForClient(
      contractId,
      clientId,
    );

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.paymentType !== 'hourly') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_HOURLY, HttpStatus.BAD_REQUEST);
    }

    if (contract.status !== 'active') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.INVALID_END_STATUS, HttpStatus.BAD_REQUEST);
    }

    const hasPendingWorklogs = await this._worklogRepository.hasPendingWorklogs(contractId);

    if (hasPendingWorklogs) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.PENDING_WORKLOGS, HttpStatus.BAD_REQUEST);
    }

    const amountAvailableForRefund =
      await this._contractTransactionRepository.findHourlyContractRefundAmount(contractId);
    console.log('Amount available for refund:', amountAvailableForRefund);

    const refundTransaction: Partial<IContractTransaction> = {
      contractId: new Types.ObjectId(contractId),
      amount: amountAvailableForRefund,
      purpose: 'refund',
      description: 'Hourly Contract refund due to contract completion',
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
    };

    await this._contractTransactionRepository.createTransaction(refundTransaction);

    await this._contractRepository.endHourlyContract(contractId);

    return { ended: true, message: 'Contract ended successfully' };
  }

  async createCancellationRequest(
    clientId: string,
    contractId: string,
    data: CreateCancellationRequestDTO,
  ): Promise<CancellationRequestResponseDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (data.clientSplitPercentage + data.freelancerSplitPercentage !== 100) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.INVALID_SPLIT_PERCENTAGE, HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findContractDetailByIdForClient(
      contractId,
      clientId,
    );

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.status === 'cancelled' || contract.status === 'cancellation_requested') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.ALREADY_CANCELLED, HttpStatus.BAD_REQUEST);
    }

    if (contract.paymentType !== 'fixed' && contract.paymentType !== 'fixed_with_milestones') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.INVALID_PAYMENT_TYPE, HttpStatus.BAD_REQUEST);
    }

    let totalHeldAmount = 0;

    if (contract.paymentType === 'fixed') {
      if (!contract.isFunded) {
        throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FUNDED, HttpStatus.BAD_REQUEST);
      }

      const hasDeliverables = await this._contractRepository.hasAnyDeliverables(contractId);
      if (!hasDeliverables) {
        throw new AppError(ERROR_MESSAGES.CONTRACT.NO_DELIVERABLES, HttpStatus.BAD_REQUEST);
      }

      const totalFunded = await this._contractTransactionRepository.findTotalFundedAmountForFixedContract(contractId);
      const totalPaid = await this._contractTransactionRepository.findTotalPaidToFreelancerByContractId(contractId);
      const totalCommission = await this._contractTransactionRepository.findTotalCommissionByContractId(contractId);
      totalHeldAmount = totalFunded - totalPaid - totalCommission;
    } else if (contract.paymentType === 'fixed_with_milestones') {
      const milestoneWithDeliverables = contract.milestones?.find(
        (milestone) => milestone.deliverables && milestone.deliverables.length > 0
      );

      if (!milestoneWithDeliverables) {
        throw new AppError(ERROR_MESSAGES.CONTRACT.NO_DELIVERABLES, HttpStatus.BAD_REQUEST);
      }

      totalHeldAmount = milestoneWithDeliverables.amount || 0;
    }

    const existingRequest = await this._cancellationRequestRepository.findPendingByContractId(contractId);
    if (existingRequest) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.CANCELLATION_REQUEST_EXISTS, HttpStatus.BAD_REQUEST);
    }

    const clientAmount = (totalHeldAmount * data.clientSplitPercentage) / 100;
    const freelancerAmount = (totalHeldAmount * data.freelancerSplitPercentage) / 100;

    const cancellationRequest = await this._cancellationRequestRepository.create({
      contractId: new Types.ObjectId(contractId),
      initiatedBy: 'client',
      initiatorId: new Types.ObjectId(clientId),
      reason: data.reason,
      clientSplitPercentage: data.clientSplitPercentage,
      freelancerSplitPercentage: data.freelancerSplitPercentage,
      totalHeldAmount,
      clientAmount,
      freelancerAmount,
      status: 'pending',
    });

    const refundableMilestones= contract.milestones?.filter(
      (milestone) => milestone.status == 'funded'
    ) || [];

    refundableMilestones.forEach(async (milestone) => {
      const refundTransaction: Partial<IContractTransaction> = {
      contractId: new Types.ObjectId(contractId),
      milestoneId: new Types.ObjectId(milestone._id),
      amount: milestone.amount,
      purpose: 'refund',
      description: 'Refund to client for milestone funded but work not done',
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
    };

    await this._contractTransactionRepository.createTransaction(refundTransaction);
  });  


   
    await this._contractRepository.updateStatusById(contractId, 'cancellation_requested');

    return toCancellationRequestResponseDTO(cancellationRequest);
  }

  async getCancellationRequest(clientId: string, contractId: string): Promise<CancellationRequestResponseDTO | null> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    const cancellationRequest = await this._cancellationRequestRepository.findByContractId(contractId);

    if (!cancellationRequest) {
      return null;
    }

    return toCancellationRequestResponseDTO(cancellationRequest);
  }

  async acceptCancellationRequest(clientId: string, contractId: string, data: AcceptCancellationRequestDTO): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    const cancellationRequest = await this._cancellationRequestRepository.findPendingByContractId(contractId);

    if (!cancellationRequest) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (cancellationRequest.status !== 'pending') {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.NOT_PENDING, HttpStatus.BAD_REQUEST);
    }

    if (cancellationRequest.initiatedBy !== 'freelancer') {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    await this._cancellationRequestRepository.updateStatus(
      cancellationRequest._id.toString(),
      'accepted',
      clientId,
      data.responseMessage,
    );

    const refundTransaction: Partial<IContractTransaction> = {
      contractId: new Types.ObjectId(contractId),
      amount: cancellationRequest.clientAmount,
      purpose: 'refund',
      description: 'Refund to client based on accepted cancellation request',
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
    };

    await this._contractTransactionRepository.createTransaction(refundTransaction);

    if (cancellationRequest.freelancerAmount > 0) {
      const releaseTransaction: Partial<IContractTransaction> = {
        contractId: new Types.ObjectId(contractId),
        amount: cancellationRequest.freelancerAmount,
        purpose: 'release',
        description: 'Release to freelancer based on accepted cancellation request',
        clientId: contract.clientId,
        freelancerId: contract.freelancerId,
      };

      await this._contractTransactionRepository.createTransaction(releaseTransaction);
    }

    await this._contractTransactionRepository.updateTransactionStatusForFixedContract(
      contractId,
      'amount_split_between_parties',
    );

    await this._contractRepository.updateStatusById(contractId, 'cancelled');

    return { success: true, message: 'Cancellation request accepted successfully' };
  }

  async raiseCancellationDispute(clientId: string, contractId: string, notes: string): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    const cancellationRequest = await this._cancellationRequestRepository.findPendingByContractId(contractId);

    if (!cancellationRequest) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (cancellationRequest.status !== 'pending') {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.NOT_PENDING, HttpStatus.BAD_REQUEST);
    }

    if (cancellationRequest.initiatedBy !== 'freelancer') {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    const existingDispute = await this._disputeRepository.findActiveDisputeByContract(contractId);

    if (existingDispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    await this._disputeRepository.createDispute({
      contractId: new Types.ObjectId(contractId),
      raisedBy: 'client',
      scope: 'contract',
      scopeId: null,
      contractType: contract.paymentType,
      reasonCode: 'cancellation_terms',
      description: notes,
      status: 'open',
    });

    await this._cancellationRequestRepository.updateStatus(
      cancellationRequest._id.toString(),
      'disputed',
      clientId,
      notes,
    );

    await this._contractRepository.updateStatusById(contractId, 'disputed');

    return { success: true, message: 'Cancellation dispute raised successfully' };
  }
}

