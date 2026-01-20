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
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';

@injectable()
export class FreelancerContractService implements IFreelancerContractService {
  private _contractRepository: IContractRepository;
  private _contractTransactionRepository: IContractTransactionRepository;

  constructor(
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IContractTransactionRepository') contractTransactionRepository: IContractTransactionRepository,
  ) {
    this._contractRepository = contractRepository;
    this._contractTransactionRepository = contractTransactionRepository;
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

    return mapContractToFreelancerDetailDTO(contract);
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

    const isFirstDeliverable=updatedContract?.deliverables?.length==1

    if(isFirstDeliverable){
    const fundedAmount = await this._contractTransactionRepository.findTotalFundedAmountForFixedContract(contractId);

    await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(contractId),
      amount: fundedAmount,
      purpose: 'hold',
      status: 'active_hold',
      description: 'The deliverables have been submitted by the freelancer, so the funds are now on hold.',
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

    const targetedMilestone=updatedContract?.milestones?.find((milestone)=>milestone._id?.toString()==data.milestoneId)

    const isFirstDeliverableForMilestone=targetedMilestone?.deliverables?.length==1

    if(isFirstDeliverableForMilestone){
    const fundedAmount = await this._contractTransactionRepository.findTotalFundedAmountForMilestone(contractId,data.milestoneId);

    await this._contractTransactionRepository.createTransaction({
      contractId: new Types.ObjectId(contractId),
      milestoneId:new Types.ObjectId(data.milestoneId),
      amount: fundedAmount,
      purpose: 'hold',
      status: 'active_hold',
      description: 'The deliverables for the milestone have been submitted by the freelancer, so the funds are now on hold.',
      clientId: contract.clientId,  
      freelancerId: contract.freelancerId,
    });
    }

    if (!updatedContract) {
      throw new AppError('Failed to submit milestone deliverable', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this._contractRepository.updateMilestoneStatus(
      contractId,
      data.milestoneId,
      'submitted',
    );

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
      throw new AppError('Failed to retrieve submitted deliverable', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const latestDeliverable =
      updatedMilestone.deliverables[updatedMilestone.deliverables.length - 1];

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
      throw new AppError('Cannot request extension for completed milestone', HttpStatus.BAD_REQUEST);
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
      throw new AppError(
        'Contract must be active to request extension',
        HttpStatus.BAD_REQUEST,
      );
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

    if (!updatedContract.extensionRequest) {
      throw new AppError('Failed to retrieve extension request', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return FreelancerContractExtensionMapper.toContractExtensionResponseDTO(
      updatedContract.extensionRequest,
    );
  }

  async cancelContract(freelancerId: string, contractId: string): Promise<{ cancelled: boolean; requiresDispute: boolean }> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const existing = await this._contractRepository.findDetailByIdForFreelancer(
      contractId,
      freelancerId,
    );
    if (!existing) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (existing.status === 'cancelled') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.ALREADY_CANCELLED, HttpStatus.BAD_REQUEST);
    }

    if (existing.status === 'refunded') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.CANCELLATION_IN_PROGRESS, HttpStatus.BAD_REQUEST);
    }

    if (existing.status === 'pending_funding') {
      await this._contractRepository.updateStatusById(contractId, 'cancelled');
      return { cancelled: true, requiresDispute: false };
    }

    const hasAnyDeliverables = await this._contractRepository.hasAnyDeliverables(contractId);

    if (!hasAnyDeliverables) {
      const contract = await this._contractRepository.updateStatusById(contractId, 'cancelled');

      const totalFunded = await this._contractTransactionRepository.findTotalFundedAmountForFixedContract(contractId);

      const refundTransaction: Partial<IContractTransaction> = {
        contractId: new Types.ObjectId(contractId),
        amount: totalFunded,
        purpose: 'refund',
        description: 'Full refund for cancelled fixed-price contract',
        clientId: contract?.clientId,
        freelancerId: contract?.freelancerId,
      };

      await this._contractTransactionRepository.createTransaction(refundTransaction);

      return { cancelled: true, requiresDispute: false };
    }

    return { cancelled: false, requiresDispute: true };
  }

  async approveChangeRequest(freelancerId: string, contractId: string, deliverableId: string): Promise<DeliverableResponseDTO> {
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
      throw new AppError('No change request to approve for this deliverable', HttpStatus.BAD_REQUEST);
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
}
