import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerContractService } from './interfaces/freelancer-contract-service.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import {
  FreelancerContractListResultDTO,
  FreelancerContractQueryParamsDTO,
  FreelancerContractDetailDTO,
} from '../../dto/freelancerDTO/freelancer-contract.dto';
import {
  DeliverableResponseDTO,
  SubmitDeliverableDTO,
} from '../../dto/freelancerDTO/freelancer-deliverable.dto';
import {
  SubmitMilestoneDeliverableDTO,
  RequestMilestoneExtensionDTO,
  MilestoneDeliverableResponseDTO,
  MilestoneExtensionResponseDTO,
} from '../../dto/freelancerDTO/freelancer-milestone.dto';
import {
  RequestContractExtensionDTO,
  ContractExtensionResponseDTO,
} from '../../dto/freelancerDTO/freelancer-contract-extension.dto';
import { mapContractModelToFreelancerContractListItemDTO } from '../../mapper/freelancerMapper/freelancer-contract-list.mapper';
import { mapContractToFreelancerDetailDTO } from '../../mapper/freelancerMapper/freelancer-contract.mapper';
import { FreelancerDeliverableMapper } from '../../mapper/freelancerMapper/freelancer-deliverable.mapper';
import { FreelancerMilestoneMapper } from '../../mapper/freelancerMapper/freelancer-milestone.mapper';
import { FreelancerContractExtensionMapper } from '../../mapper/freelancerMapper/freelancer-contract-extension.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { Types } from 'mongoose';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { ICancellationRequestRepository } from '../../repositories/interfaces/cancellation-request-repository.interface';
import { IDisputeRepository } from '../../repositories/interfaces/dispute-repository.interface';
import { IContractActivityService } from '../commonServices/interfaces/contract-activity-service.interface';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';
import { IContract } from '../../models/interfaces/contract.model.interface';
import { INotificationService } from '../commonServices/interfaces/notification-service.interface';
import {
  FreelancerCancellationRequestDTO,
  AcceptCancellationRequestDTO,
} from '../../dto/freelancerDTO/freelancer-cancellation-request.dto';
import {
  CreateFreelancerCancellationRequestDTO,
  FreelancerCancellationRequestResponseDTO,
} from '../../dto/freelancerDTO/freelancer-create-cancellation-request.dto';
import { mapCancellationRequestToFreelancerDTO } from '../../mapper/freelancerMapper/freelancer-cancellation-request.mapper';
import { toFreelancerCancellationRequestResponseDTO } from '../../mapper/freelancerMapper/freelancer-create-cancellation-request.mapper';

@injectable()
export class FreelancerContractService implements IFreelancerContractService {
  private _contractRepository: IContractRepository;
  private _contractTransactionRepository: IContractTransactionRepository;
  private _cancellationRequestRepository: ICancellationRequestRepository;
  private _disputeRepository: IDisputeRepository;
  private _contractActivityService: IContractActivityService;
  private _notificationService: INotificationService;

  constructor(
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
    @inject('ICancellationRequestRepository')
    cancellationRequestRepository: ICancellationRequestRepository,
    @inject('IDisputeRepository') disputeRepository: IDisputeRepository,
    @inject('IContractActivityService') contractActivityService: IContractActivityService,
    @inject('INotificationService') notificationService: INotificationService,
  ) {
    this._contractRepository = contractRepository;
    this._contractTransactionRepository = contractTransactionRepository;
    this._cancellationRequestRepository = cancellationRequestRepository;
    this._disputeRepository = disputeRepository;
    this._contractActivityService = contractActivityService;
    this._notificationService = notificationService;
  }

  async getAllContracts(
    freelancerId: string,
    query: FreelancerContractQueryParamsDTO,
  ): Promise<FreelancerContractListResultDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    const normalizedQuery: FreelancerContractQueryParamsDTO = {
      search: query.search,
      page: query.page && query.page > 0 ? query.page : 1,
      limit: query.limit && query.limit > 0 ? query.limit : 10,
      filters: query.filters || {},
    };

    const [contracts, total] = await Promise.all([
      this._contractRepository.findAllForFreelancer(freelancerId, normalizedQuery),
      this._contractRepository.countForFreelancer(freelancerId, normalizedQuery),
    ]);

    const items = contracts.map(mapContractModelToFreelancerContractListItemDTO);

    return {
      items,
      page: normalizedQuery.page!,
      limit: normalizedQuery.limit!,
      total,
      pages: Math.ceil(total / normalizedQuery.limit!),
    };
  }

  async getContractDetail(
    freelancerId: string,
    contractId: string,
  ): Promise<FreelancerContractDetailDTO> {
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
      throw new AppError(
        'Contract not found or you are not authorized to view it',
        HttpStatus.NOT_FOUND,
      );
    }

    const financialSummary =
      await this._contractTransactionRepository.findFinancialSummaryByContractId(contractId);

    const disputeDetail = (await this._disputeRepository.findDisputesByContractId(contractId))?.[0];
    console.log(disputeDetail);

    return mapContractToFreelancerDetailDTO(
      contract,
      financialSummary,
      disputeDetail ? disputeDetail : undefined,
    );
  }

  async submitDeliverable(
    freelancerId: string,
    contractId: string,
    data: SubmitDeliverableDTO,
  ): Promise<DeliverableResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!data.files || data.files.length === 0) {
      throw new AppError('At least one file is required', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(
        'You are not authorized to submit deliverables for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    if (contract.status !== 'active') {
      throw new AppError('Contract must be active to submit deliverables', HttpStatus.BAD_REQUEST);
    }

    if (contract.paymentType !== 'fixed') {
      throw new AppError('Only fixed-price contracts support deliverables', HttpStatus.BAD_REQUEST);
    }

    const updatedContract = await this._contractRepository.submitDeliverable(
      contractId,
      freelancerId,
      data.files,
      data.message,
    );

    const isFirstDeliverable = updatedContract?.deliverables?.length == 1;

    if (isFirstDeliverable) {
      const fundedAmount =
        await this._contractTransactionRepository.findTotalFundedAmountForFixedContract(contractId);

      await this._contractTransactionRepository.createTransaction({
        contractId: new Types.ObjectId(contractId),
        amount: fundedAmount,
        purpose: 'hold',
        status: 'active_hold',
        description:
          'The deliverables have been submitted by the freelancer, so the funds are now on hold.',
        clientId: contract.clientId,
        freelancerId: contract.freelancerId,
      });
    }

    if (
      !updatedContract ||
      !updatedContract.deliverables ||
      updatedContract.deliverables.length === 0
    ) {
      throw new AppError('Failed to submit deliverable', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const latestDeliverable = updatedContract.deliverables[updatedContract.deliverables.length - 1];

    await this._contractActivityService.logActivity(
      new Types.ObjectId(contractId),
      'deliverable_submitted',
      'freelancer',
      new Types.ObjectId(freelancerId),
      'Deliverable Submitted',
      `Freelancer submitted deliverable (Version ${latestDeliverable.version}) with ${data.files.length} file(s)`,
      {
        deliverableId: latestDeliverable._id?.toString(),
        version: latestDeliverable.version,
        filesCount: data.files.length,
      },
    );

    await this._notificationService.createAndEmitNotification(contract.clientId.toString(), {
      role: 'client',
      title: 'Deliverable Submitted',
      message: `A freelancer has submitted a deliverable for contract "${contract.title}".`,
      type: 'job',
      relatedId: contractId,
    });

    return FreelancerDeliverableMapper.toDeliverableResponseDTO(latestDeliverable, updatedContract);
  }

  async submitMilestoneDeliverable(
    freelancerId: string,
    contractId: string,
    data: SubmitMilestoneDeliverableDTO,
  ): Promise<MilestoneDeliverableResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.milestoneId)) {
      throw new AppError('Invalid milestoneId', HttpStatus.BAD_REQUEST);
    }

    if (!data.files || data.files.length === 0) {
      throw new AppError('At least one file is required', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(
        'You are not authorized to submit deliverables for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    if (contract.status !== 'active') {
      throw new AppError('Contract must be active to submit deliverables', HttpStatus.BAD_REQUEST);
    }

    if (contract.paymentType !== 'fixed_with_milestones') {
      throw new AppError(
        'Only milestone-based contracts support milestone deliverables',
        HttpStatus.BAD_REQUEST,
      );
    }

    const milestone = contract.milestones?.find((m) => m._id?.toString() === data.milestoneId);

    if (!milestone) {
      throw new AppError('Milestone not found', HttpStatus.NOT_FOUND);
    }

    if (
      milestone.status === 'pending_funding' ||
      milestone.status === 'submitted' ||
      milestone.status === 'approved' ||
      milestone.status === 'paid'
    ) {
      throw new AppError(
        'Cannot submit deliverable for this milestone in its current status',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedContract = await this._contractRepository.submitMilestoneDeliverable(
      contractId,
      data.milestoneId,
      freelancerId,
      data.files,
      data.message,
    );

    const targetedMilestone = updatedContract?.milestones?.find(
      (milestone) => milestone._id?.toString() == data.milestoneId,
    );

    const isFirstDeliverableForMilestone = targetedMilestone?.deliverables?.length == 1;

    if (isFirstDeliverableForMilestone) {
      const fundedAmount =
        await this._contractTransactionRepository.findTotalFundedAmountForMilestone(
          contractId,
          data.milestoneId,
        );

      await this._contractTransactionRepository.createTransaction({
        contractId: new Types.ObjectId(contractId),
        milestoneId: new Types.ObjectId(data.milestoneId),
        amount: fundedAmount,
        purpose: 'hold',
        status: 'active_hold',
        description:
          'The deliverables for the milestone have been submitted by the freelancer, so the funds are now on hold.',
        clientId: contract.clientId,
        freelancerId: contract.freelancerId,
      });
    }

    if (!updatedContract) {
      throw new AppError(
        'Failed to submit milestone deliverable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this._contractRepository.updateMilestoneStatus(contractId, data.milestoneId, 'submitted');

    await this._contractRepository.addTimelineEntry(
      contractId,
      'milestone_deliverable_submitted',
      freelancerId,
      data.milestoneId,
      `Deliverable submitted for milestone: ${milestone.title}`,
    );

    const updatedMilestone = updatedContract.milestones?.find(
      (m) => m._id?.toString() === data.milestoneId,
    );

    if (
      !updatedMilestone ||
      !updatedMilestone.deliverables ||
      updatedMilestone.deliverables.length === 0
    ) {
      throw new AppError(
        'Failed to retrieve submitted deliverable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const latestDeliverable =
      updatedMilestone.deliverables[updatedMilestone.deliverables.length - 1];

    await this._contractActivityService.logActivity(
      new Types.ObjectId(contractId),
      'deliverable_submitted',
      'freelancer',
      new Types.ObjectId(freelancerId),
      'Milestone Deliverable Submitted',
      `Freelancer submitted deliverable for milestone "${milestone.title}" (Version ${latestDeliverable.version}) with ${data.files.length} file(s)`,
      {
        milestoneId: data.milestoneId,
        deliverableId: latestDeliverable._id?.toString(),
        version: latestDeliverable.version,
        filesCount: data.files.length,
      },
    );

    await this._notificationService.createAndEmitNotification(contract.clientId.toString(), {
      role: 'client',
      title: 'Milestone Deliverable Submitted',
      message: `A freelancer has submitted a deliverable for milestone "${milestone.title}".`,
      type: 'job',
      relatedId: contractId,
    });

    return FreelancerMilestoneMapper.toMilestoneDeliverableResponseDTO(
      latestDeliverable,
      updatedMilestone,
    );
  }

  async requestMilestoneExtension(
    freelancerId: string,
    contractId: string,
    data: RequestMilestoneExtensionDTO,
  ): Promise<MilestoneExtensionResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.milestoneId)) {
      throw new AppError('Invalid milestoneId', HttpStatus.BAD_REQUEST);
    }

    if (!data.reason || data.reason.trim().length === 0) {
      throw new AppError('Extension reason is required', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(
        'You are not authorized to request extension for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    if (contract.status !== 'active') {
      throw new AppError(
        'Contract must be active to request milestone extension',
        HttpStatus.BAD_REQUEST,
      );
    }

    const milestone = contract.milestones?.find((m) => m._id?.toString() === data.milestoneId);

    if (!milestone) {
      throw new AppError('Milestone not found', HttpStatus.NOT_FOUND);
    }

    if (milestone.status === 'paid' || milestone.status === 'approved') {
      throw new AppError(
        'Cannot request extension for completed milestone',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (milestone.extensionRequest && milestone.extensionRequest.status === 'pending') {
      throw new AppError('Extension request already pending', HttpStatus.BAD_REQUEST);
    }

    const requestedDeadline = new Date(data.requestedDeadline);
    if (requestedDeadline <= milestone.expectedDelivery) {
      throw new AppError(
        'Requested deadline must be after current deadline',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedContract = await this._contractRepository.requestMilestoneExtension(
      contractId,
      data.milestoneId,
      freelancerId,
      requestedDeadline,
      data.reason,
    );

    if (!updatedContract) {
      throw new AppError('Failed to request milestone extension', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this._contractRepository.addTimelineEntry(
      contractId,
      'milestone_extension_requested',
      freelancerId,
      data.milestoneId,
      `Extension requested for milestone: ${milestone.title}`,
    );

    await this._notificationService.createAndEmitNotification(contract.clientId.toString(), {
      role: 'client',
      title: 'Milestone Extension Requested',
      message: `A freelancer has requested an extension for milestone "${milestone.title}".`,
      type: 'system',
      relatedId: contractId,
    });

    const updatedMilestone = updatedContract.milestones?.find(
      (m) => m._id?.toString() === data.milestoneId,
    );

    if (!updatedMilestone?.extensionRequest) {
      throw new AppError('Failed to retrieve extension request', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return FreelancerMilestoneMapper.toMilestoneExtensionResponseDTO(
      updatedMilestone.extensionRequest,
    );
  }

  async requestContractExtension(
    freelancerId: string,
    contractId: string,
    data: RequestContractExtensionDTO,
  ): Promise<ContractExtensionResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (!data.reason || data.reason.trim().length === 0) {
      throw new AppError('Extension reason is required', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(
        'You are not authorized to request extension for this contract',
        HttpStatus.FORBIDDEN,
      );
    }

    if (contract.status !== 'active') {
      throw new AppError('Contract must be active to request extension', HttpStatus.BAD_REQUEST);
    }

    if (contract.paymentType !== 'fixed') {
      throw new AppError(
        'Only fixed payment contracts support deadline extensions',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (contract.extensionRequest && contract.extensionRequest.status === 'pending') {
      throw new AppError('Extension request already pending', HttpStatus.BAD_REQUEST);
    }

    const requestedDeadline = new Date(data.requestedDeadline);
    if (requestedDeadline <= contract.expectedEndDate) {
      throw new AppError(
        'Requested deadline must be after current deadline',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedContract = await this._contractRepository.requestContractExtension(
      contractId,
      freelancerId,
      requestedDeadline,
      data.reason,
    );

    if (!updatedContract) {
      throw new AppError('Failed to request contract extension', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this._contractRepository.addTimelineEntry(
      contractId,
      'contract_extension_requested',
      freelancerId,
      undefined,
      `Extension requested for contract deadline`,
    );

    await this._notificationService.createAndEmitNotification(contract.clientId.toString(), {
      role: 'client',
      title: 'Contract Extension Requested',
      message: `A freelancer has requested a deadline extension for contract "${contract.title}".`,
      type: 'system',
      relatedId: contractId,
    });

    if (!updatedContract.extensionRequest) {
      throw new AppError('Failed to retrieve extension request', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return FreelancerContractExtensionMapper.toContractExtensionResponseDTO(
      updatedContract.extensionRequest,
    );
  }

  async cancelContract(
    freelancerId: string,
    contractId: string,
    cancelContractReason: string,
  ): Promise<{ cancelled: boolean; requiresDispute: boolean }> {
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
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.status === 'cancelled') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.ALREADY_CANCELLED, HttpStatus.BAD_REQUEST);
    }

    if (contract.status === 'refunded') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.CANCELLATION_IN_PROGRESS, HttpStatus.BAD_REQUEST);
    }

    await this._contractRepository.cancelContractByUser(
      contractId,
      'freelancer',
      cancelContractReason,
    );

    const paymentType = contract.paymentType;

    switch (paymentType) {
      case 'fixed':
        return this.cancelFixedContract(contract, contractId, cancelContractReason);

      case 'fixed_with_milestones':
        return this.cancelFixedWithMilestonesContract(contract, contractId, cancelContractReason);

      case 'hourly':
        return this.cancelHourlyContract(contract, contractId, cancelContractReason);

      default:
        throw new AppError('Invalid contract type', HttpStatus.BAD_REQUEST);
    }
  }

  private async cancelFixedContract(
    contract: IContract,
    contractId: string,
    cancelContractReason: string,
  ): Promise<{ cancelled: boolean; requiresDispute: boolean }> {
    if (contract.status === 'pending_funding') {
      await this._contractRepository.cancelContractByUser(
        contractId,
        'freelancer',
        cancelContractReason,
      );
      return { cancelled: true, requiresDispute: false };
    }

    if (!contract.isFunded) {
      await this._contractRepository.cancelContractByUser(
        contractId,
        'freelancer',
        cancelContractReason,
      );
      return { cancelled: true, requiresDispute: false };
    }

    const hasAnyDeliverables = await this._contractRepository.hasAnyDeliverables(contractId);
    if (!hasAnyDeliverables) {
      await this._contractRepository.cancelContractByUser(
        contractId,
        'freelancer',
        cancelContractReason,
      );

      const totalFunded =
        await this._contractTransactionRepository.findTotalFundedAmountForFixedContract(contractId);

      const refundTransaction: Partial<IContractTransaction> = {
        contractId: new Types.ObjectId(contractId),
        amount: totalFunded,
        purpose: 'refund',
        description: 'Full refund for cancelled fixed-price contract',
        clientId: contract.clientId,
        freelancerId: contract.freelancerId,
      };

      await this._contractTransactionRepository.createTransaction(refundTransaction);
      await this._contractTransactionRepository.updateTransactionStatusForFixedContract(
        contractId,
        'refunded_back_to_client',
      );

      return { cancelled: true, requiresDispute: false };
    }

    return { cancelled: false, requiresDispute: true };
  }

  private async cancelFixedWithMilestonesContract(
    contract: IContract,
    contractId: string,
    cancelContractReason: string,
  ): Promise<{ cancelled: boolean; requiresDispute: boolean }> {
    const isClientFundedForAtLeastOneMilestone = contract?.milestones?.some(
      (milestone) => milestone.isFunded === true,
    );

    if (!isClientFundedForAtLeastOneMilestone) {
      await this._contractRepository.cancelContractByUser(
        contractId,
        'freelancer',
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
        'freelancer',
        cancelContractReason,
      );

      const fundedMilestones = contract.milestones?.filter(
        (milestone) => milestone.isFunded === true,
      );

      for (const milestone of fundedMilestones || []) {
        const totalFunded =
          await this._contractTransactionRepository.findTotalFundedAmountForMilestone(
            contractId,
            milestone._id?.toString() || '',
          );

        const refundTransaction: Partial<IContractTransaction> = {
          contractId: new Types.ObjectId(contractId),
          milestoneId: milestone._id,
          amount: totalFunded,
          purpose: 'refund',
          description: `Refund for milestone: ${milestone.title} due to contract cancellation`,
          clientId: contract.clientId,
          freelancerId: contract.freelancerId,
        };

        await this._contractTransactionRepository.createTransaction(refundTransaction);
        await this._contractTransactionRepository.updateTransactionStatusForMilestoneContract(
          contractId,
          milestone._id?.toString() || '',
          'refunded_back_to_client',
        );

        await this._contractRepository.updateMilestoneStatus(
          contractId,
          milestone._id?.toString() || '',
          'cancelled',
        );
      }

      const unpaidMilestones = contract.milestones?.filter(
        (milestone) => milestone.status === 'pending_funding',
      );

      for (const unpaidMilestone of unpaidMilestones || []) {
        await this._contractRepository.updateMilestoneStatus(
          contractId,
          unpaidMilestone._id?.toString() || '',
          'cancelled',
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
    throw new AppError(
      'Hourly contract cancellation not yet implemented',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async endHourlyContract(
    freelancerId: string,
    contractId: string,
  ): Promise<{ ended: boolean; message: string }> {
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
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.paymentType !== 'hourly') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_HOURLY, HttpStatus.BAD_REQUEST);
    }

    if (contract.status !== 'active') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.INVALID_END_STATUS, HttpStatus.BAD_REQUEST);
    }

    const amountAvailableForRefund =
      await this._contractTransactionRepository.findHourlyContractRefundAmount(contractId);

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

  async approveChangeRequest(
    freelancerId: string,
    contractId: string,
    deliverableId: string,
  ): Promise<DeliverableResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }
    if (!Types.ObjectId.isValid(deliverableId)) {
      throw new AppError('Invalid deliverableId', HttpStatus.BAD_REQUEST);
    }
    const contract = await this._contractRepository.findById(contractId);
    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }
    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(
        'You are not authorized to approve change requests for this contract',
        HttpStatus.FORBIDDEN,
      );
    }
    const deliverable = contract.deliverables?.find((d) => d._id?.toString() === deliverableId);
    if (!deliverable) {
      throw new AppError('Deliverable not found', HttpStatus.NOT_FOUND);
    }
    if (deliverable.status !== 'changes_requested') {
      throw new AppError(
        'No change request to approve for this deliverable',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updatedContract = await this._contractRepository.approveDeliverableChangeRequest(
      contractId,
      deliverableId,
    );

    return FreelancerDeliverableMapper.toDeliverableResponseDTO(
      updatedContract!.deliverables!.find((d) => d._id?.toString() === deliverableId)!,
      updatedContract!,
    );
  }

  async getCancellationRequest(
    freelancerId: string,
    contractId: string,
  ): Promise<FreelancerCancellationRequestDTO | null> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    const cancellationRequest =
      await this._cancellationRequestRepository.findByContractId(contractId);

    if (!cancellationRequest) {
      return null;
    }

    return mapCancellationRequestToFreelancerDTO(cancellationRequest);
  }

  async acceptCancellationRequest(
    freelancerId: string,
    contractId: string,
    data: AcceptCancellationRequestDTO,
  ): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(
        ERROR_MESSAGES.CANCELLATION_REQUEST.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
      );
    }

    const cancellationRequest =
      await this._cancellationRequestRepository.findPendingByContractId(contractId);

    if (!cancellationRequest) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (cancellationRequest.status !== 'pending') {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.NOT_PENDING, HttpStatus.BAD_REQUEST);
    }

    if (cancellationRequest.initiatedBy !== 'client') {
      throw new AppError(
        ERROR_MESSAGES.CANCELLATION_REQUEST.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
      );
    }

    await this._cancellationRequestRepository.updateStatus(
      cancellationRequest._id.toString(),
      'accepted',
      freelancerId,
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

  async raiseCancellationDispute(
    freelancerId: string,
    contractId: string,
    notes: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findById(contractId);

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    const cancellationRequest =
      await this._cancellationRequestRepository.findPendingByContractId(contractId);

    if (!cancellationRequest) {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (cancellationRequest.status !== 'pending') {
      throw new AppError(ERROR_MESSAGES.CANCELLATION_REQUEST.NOT_PENDING, HttpStatus.BAD_REQUEST);
    }

    if (cancellationRequest.initiatedBy !== 'client') {
      throw new AppError(
        ERROR_MESSAGES.CANCELLATION_REQUEST.UNAUTHORIZED_ACCESS,
        HttpStatus.FORBIDDEN,
      );
    }

    const existingDispute = await this._disputeRepository.findActiveDisputeByContract(contractId);

    if (existingDispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.ALREADY_EXISTS, HttpStatus.BAD_REQUEST);
    }

    await this._disputeRepository.createDispute({
      contractId: new Types.ObjectId(contractId),
      raisedBy: 'freelancer',
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
      freelancerId,
    );

    await this._contractRepository.updateStatusById(contractId, 'disputed');

    return { success: true, message: 'Dispute raised successfully' };
  }

  async createCancellationRequest(
    freelancerId: string,
    contractId: string,
    data: CreateFreelancerCancellationRequestDTO,
  ): Promise<FreelancerCancellationRequestResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    if (data.clientSplitPercentage + data.freelancerSplitPercentage !== 100) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.INVALID_SPLIT_PERCENTAGE, HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
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

      const totalFunded =
        await this._contractTransactionRepository.findTotalFundedAmountForFixedContract(contractId);
      const totalPaid =
        await this._contractTransactionRepository.findTotalPaidToFreelancerByContractId(contractId);
      const totalCommission =
        await this._contractTransactionRepository.findTotalCommissionByContractId(contractId);
      totalHeldAmount = totalFunded - totalPaid - totalCommission;
    } else if (contract.paymentType === 'fixed_with_milestones') {
      const milestoneWithDeliverables = contract.milestones?.find(
        (milestone) => milestone.deliverables && milestone.deliverables.length > 0,
      );

      if (!milestoneWithDeliverables) {
        throw new AppError(ERROR_MESSAGES.CONTRACT.NO_DELIVERABLES, HttpStatus.BAD_REQUEST);
      }

      totalHeldAmount = milestoneWithDeliverables.amount || 0;
    }

    const existingRequest =
      await this._cancellationRequestRepository.findPendingByContractId(contractId);
    if (existingRequest) {
      throw new AppError(
        ERROR_MESSAGES.CONTRACT.CANCELLATION_REQUEST_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const clientAmount = (totalHeldAmount * data.clientSplitPercentage) / 100;
    const freelancerAmount = (totalHeldAmount * data.freelancerSplitPercentage) / 100;

    const cancellationRequest = await this._cancellationRequestRepository.create({
      contractId: new Types.ObjectId(contractId),
      initiatedBy: 'freelancer',
      initiatorId: new Types.ObjectId(freelancerId),
      reason: data.reason,
      clientSplitPercentage: data.clientSplitPercentage,
      freelancerSplitPercentage: data.freelancerSplitPercentage,
      totalHeldAmount,
      clientAmount,
      freelancerAmount,
      status: 'pending',
    });

    const refundableMilestones =
      contract.milestones?.filter((milestone) => milestone.status == 'funded') || [];

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

    return toFreelancerCancellationRequestResponseDTO(cancellationRequest);
  }

  async uploadWorkspaceFile(
    freelancerId: string,
    contractId: string,
    fileData: { fileId: string; fileName: string; fileUrl: string; fileSize?: number; fileType?: string },
  ): Promise<FreelancerContractDetailDTO> {
    const contract = await this._contractRepository.findById(contractId);
    if (!contract || contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    await this._contractRepository.addWorkspaceFile(contractId, {
      ...fileData,
      uploadedBy: new Types.ObjectId(freelancerId) as any,
      uploadedAt: new Date(),
    });
    return this.getContractDetail(freelancerId, contractId);
  }

  async deleteWorkspaceFile(
    freelancerId: string,
    contractId: string,
    fileId: string,
  ): Promise<FreelancerContractDetailDTO> {
    const contract = await this._contractRepository.findById(contractId);
    if (!contract || contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const file = contract.workspaceFiles?.find((f) => f.fileId === fileId);
    if (!file) {
      throw new AppError('File not found', HttpStatus.NOT_FOUND);
    }
    if (file.uploadedBy.toString() !== freelancerId) {
      throw new AppError('Unauthorized to delete this file', HttpStatus.FORBIDDEN);
    }
    await this._contractRepository.deleteWorkspaceFile(contractId, fileId);
    return this.getContractDetail(freelancerId, contractId);
  }
}
