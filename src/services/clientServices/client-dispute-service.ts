import { injectable, inject } from 'tsyringe';
import { IClientDisputeService } from './interfaces/client-dispute-service.interface';
import { IDisputeRepository } from '../../repositories/interfaces/dispute-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { CreateDisputeRequestDTO, DisputeResponseDTO } from '../../dto/clientDTO/client-dispute.dto';
import { mapDisputeToResponseDTO } from '../../mapper/clientMapper/client-dispute.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { DISPUTE_REASONS } from '../../contants/dispute.constants';
import { Types } from 'mongoose';

@injectable()
export class ClientDisputeService implements IClientDisputeService {
  private _disputeRepository: IDisputeRepository;
  private _contractRepository: IContractRepository;

  constructor(
    @inject('IDisputeRepository') disputeRepository: IDisputeRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
  ) {
    this._disputeRepository = disputeRepository;
    this._contractRepository = contractRepository;
  }

  async createDispute(clientId: string, data: CreateDisputeRequestDTO): Promise<DisputeResponseDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(data.contractId)) {
      throw new AppError('Invalid contractId', HttpStatus.BAD_REQUEST);
    }

   

    const contract = await this._contractRepository.findContractDetailByIdForClient(
      data.contractId,
      clientId,
    );

    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const validReasons = Object.values(DISPUTE_REASONS);
    if (!validReasons.includes(data.reasonCode as typeof validReasons[number])) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.INVALID_REASON, HttpStatus.BAD_REQUEST);
    }

    const existingDispute = await this._disputeRepository.findActiveDisputeByContract(data.contractId);
    if (existingDispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    if (data.scopeId && !Types.ObjectId.isValid(data.scopeId)) {
      throw new AppError('Invalid scopeId', HttpStatus.BAD_REQUEST);
    }

    const dispute = await this._disputeRepository.createDispute({
      contractId: new Types.ObjectId(data.contractId),
      raisedBy: 'client',
      scope: data.scope || 'contract',
      scopeId: data.scopeId ? new Types.ObjectId(data.scopeId) : null,
      contractType: contract.paymentType,
      reasonCode: data.reasonCode,
      description: data.description,
      status: 'open',
    });

    return mapDisputeToResponseDTO(dispute);
  }

  async getDisputeById(clientId: string, disputeId: string): Promise<DisputeResponseDTO> {
    if (!Types.ObjectId.isValid(clientId)) {
      throw new AppError('Invalid clientId', HttpStatus.BAD_REQUEST);
    }

    if (!Types.ObjectId.isValid(disputeId)) {
      throw new AppError('Invalid disputeId', HttpStatus.BAD_REQUEST);
    }

    const dispute = await this._disputeRepository.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const contract = await this._contractRepository.findById(dispute.contractId.toString());
    if (!contract || contract.clientId.toString() !== clientId) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.UNAUTHORIZED_ACCESS, HttpStatus.FORBIDDEN);
    }

    return mapDisputeToResponseDTO(dispute);
  }

  async getDisputesByContract(clientId: string, contractId: string): Promise<DisputeResponseDTO[]> {
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

    const disputes = await this._disputeRepository.findDisputesByContractId(contractId);
    return disputes.map(mapDisputeToResponseDTO);
  }

  async cancelContractWithDispute(
    clientId: string,
    contractId: string,
    reasonCode: string,
    description: string,
  ): Promise<DisputeResponseDTO> {
  
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

    const existingDispute = await this._disputeRepository.findActiveDisputeByContract(contractId);
    if (existingDispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.ALREADY_EXISTS, HttpStatus.CONFLICT);
    }

    const dispute = await this._disputeRepository.createDispute({
      contractId: new Types.ObjectId(contractId),
      raisedBy: 'client',
      scope: 'contract',
      scopeId: null,
      contractType: contract.paymentType,
      reasonCode,
      description,
      status: 'open',
    });

    await this._contractRepository.updateStatusById(contractId, 'disputed');

    return mapDisputeToResponseDTO(dispute);
  }
}
