import { injectable, inject } from 'tsyringe';
import { IFreelancerDisputeService } from './interfaces/freelancer-dispute-service.interface';
import { IDisputeRepository } from '../../repositories/interfaces/dispute-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import {
  CreateDisputeRequestDTO,
  DisputeResponseDTO,
  RaiseDisputeForCancelledContractDTO,
} from '../../dto/freelancerDTO/freelancer-dispute.dto';
import { mapDisputeToResponseDTO } from '../../mapper/freelancerMapper/freelancer-dispute.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { DISPUTE_REASONS } from '../../contants/dispute.constants';
import { Types } from 'mongoose';
import { IContractTransactionRepository } from 'src/repositories/interfaces/contract-transaction-repository.interface';

@injectable()
export class FreelancerDisputeService implements IFreelancerDisputeService {
  private _disputeRepository: IDisputeRepository;
  private _contractRepository: IContractRepository;
  private _contractTransactionRepository: IContractTransactionRepository;
  constructor(
    @inject('IDisputeRepository') disputeRepository: IDisputeRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
  ) {
    this._disputeRepository = disputeRepository;
    this._contractRepository = contractRepository;
    this._contractTransactionRepository = contractTransactionRepository;
  }

  async createDispute(
    freelancerId: string,
    data: CreateDisputeRequestDTO,
  ): Promise<DisputeResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

    const contract = await this._contractRepository.findDetailByIdForFreelancer(
      data.contractId,
      freelancerId,
    );

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const validReasons = Object.values(DISPUTE_REASONS);
    if (!validReasons.includes(data.reasonCode as (typeof validReasons)[number])) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.INVALID_REASON, HttpStatus.BAD_REQUEST);
    }

    const existingDispute = await this._disputeRepository.findActiveDisputeByContract(
      data.contractId,
    );
    if (existingDispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    if (data.scopeId && !Types.ObjectId.isValid(data.scopeId)) {
      throw new AppError('Invalid scopeId', HttpStatus.BAD_REQUEST);
    }

    const dispute = await this._disputeRepository.createDispute({
      contractId: new Types.ObjectId(data.contractId),
      raisedBy: 'freelancer',
      scope: data.scope || 'contract',
      scopeId: data.scopeId ? new Types.ObjectId(data.scopeId) : null,
      contractType: contract.paymentType,
      reasonCode: data.reasonCode,
      description: data.description,
      status: 'open',
    });

    if (contract.paymentType === 'fixed') {
      await this._contractTransactionRepository.updateTransactionStatusForFixedContract(
        data.contractId,
        'frozen_dispute',
      );
    } else if (contract.paymentType === 'fixed_with_milestones') {
      await this._contractTransactionRepository.updateTransactionStatusForMilestoneContract(
        data.contractId,
        data.scopeId!,
        'frozen_dispute',
      );
    }

    return mapDisputeToResponseDTO(dispute);
  }

  async getDisputeById(freelancerId: string, disputeId: string): Promise<DisputeResponseDTO> {
    if (!Types.ObjectId.isValid(freelancerId)) {
      throw new AppError('Invalid freelancerId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(disputeId)) {
      throw new AppError('Invalid disputeId', HttpStatus.BAD_REQUEST);
    }

    const dispute = await this._disputeRepository.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const contract = await this._contractRepository.findById(dispute.contractId.toString());
    if (!contract || contract.freelancerId.toString() !== freelancerId) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    return mapDisputeToResponseDTO(dispute);
  }

  async getDisputesByContract(
    freelancerId: string,
    contractId: string,
  ): Promise<DisputeResponseDTO[]> {
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

    const disputes = await this._disputeRepository.findDisputesByContractId(contractId);
    return disputes.map(mapDisputeToResponseDTO);
  }

  async raiseDisputeForCancelledContract(
    freelancerId: string,
    contractId: string,
    data: RaiseDisputeForCancelledContractDTO,
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
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.status !== 'cancelled') {
      throw new AppError(ERROR_MESSAGES.DISPUTE.CANNOT_RAISE_DISPUTE, HttpStatus.BAD_REQUEST);
    }

    if (contract.cancelledBy !== 'client') {
      throw new AppError(ERROR_MESSAGES.DISPUTE.CANNOT_RAISE_DISPUTE, HttpStatus.BAD_REQUEST);
    }

    const existingDispute = await this._disputeRepository.findActiveDisputeByContract(contractId);
    if (existingDispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    let scope: 'contract' | 'milestone' | 'worklog' = 'contract';
    let scopeId: Types.ObjectId | null = null;

    if (contract.paymentType === 'fixed_with_milestones') {
      if (!data.milestoneId) {
        throw new AppError(
          'Milestone ID is required for milestone-based contracts',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!Types.ObjectId.isValid(data.milestoneId)) {
        throw new AppError('Invalid milestoneId', HttpStatus.BAD_REQUEST);
      }

      scope = 'milestone';
      scopeId = new Types.ObjectId(data.milestoneId);
    } else if (contract.paymentType === 'hourly') {
      throw new AppError(
        'Dispute for hourly contracts is not yet implemented',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }

    const dispute = await this._disputeRepository.createDispute({
      contractId: new Types.ObjectId(contractId),
      raisedBy: 'freelancer',
      scope,
      scopeId,
      contractType: contract.paymentType,
      reasonCode: DISPUTE_REASONS.CLIENT_UNFAIR_CANCELLATION,
      description: data.notes,
      status: 'open',
    });

    await this._contractRepository.updateStatusById(contractId, 'disputed');

    return mapDisputeToResponseDTO(dispute);
  }

  async cancelContractWithDispute(
    freelancerId: string,
    contractId: string,
    reasonCode: string,
    description: string,
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
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (contract.status === 'cancelled') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.ALREADY_CANCELLED, HttpStatus.BAD_REQUEST);
    }

    if (contract.status === 'refunded') {
      throw new AppError(ERROR_MESSAGES.CONTRACT.CANCELLATION_IN_PROGRESS, HttpStatus.BAD_REQUEST);
    }

    const existingDispute = await this._disputeRepository.findActiveDisputeByContract(contractId);
    if (existingDispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const dispute = await this._disputeRepository.createDispute({
      contractId: new Types.ObjectId(contractId),
      raisedBy: 'freelancer',
      scope: 'contract',
      scopeId: null,
      contractType: contract.paymentType,
      reasonCode,
      description,
      status: 'open',
    });

    await this._contractRepository.updateStatusById(contractId, 'cancelled');

    return mapDisputeToResponseDTO(dispute);
  }
}
