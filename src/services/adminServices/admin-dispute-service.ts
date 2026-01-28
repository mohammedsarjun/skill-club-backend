import { injectable, inject } from 'tsyringe';
import { IAdminDisputeService } from './interfaces/admin-dispute-service.interface';
import { IDisputeRepository } from '../../repositories/interfaces/dispute-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import {
  AdminDisputeQueryParamsDTO,
  AdminDisputeListResultDTO,
  AdminDisputeDetailDTO,
} from '../../dto/adminDTO/admin-dispute.dto';
import { SplitDisputeFundsDTO, SplitDisputeFundsResponseDTO } from '../../dto/adminDTO/admin-split-dispute-funds.dto';
import { mapDisputeToAdminListItemDTO, mapDisputeToAdminDetailDTO } from '../../mapper/adminMapper/admin-dispute.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';
import { Types } from 'mongoose';

@injectable()
export class AdminDisputeService implements IAdminDisputeService {
  private _disputeRepository: IDisputeRepository;
  private _contractRepository: IContractRepository;
  private _contractTransactionRepository: IContractTransactionRepository;

  constructor(
    @inject('IDisputeRepository')
    disputeRepository: IDisputeRepository,
    @inject('IContractRepository')
    contractRepository: IContractRepository,
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
  ) {
    this._disputeRepository = disputeRepository;
    this._contractRepository = contractRepository;
    this._contractTransactionRepository = contractTransactionRepository;
  }

  async getAllDisputes(query: AdminDisputeQueryParamsDTO): Promise<AdminDisputeListResultDTO> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const disputes = await this._disputeRepository.findAllForAdmin(query);
    const total = await this._disputeRepository.countForAdmin(query);

    const items = disputes.map(mapDisputeToAdminListItemDTO);
    const pages = Math.ceil(total / limit);

    return {
      items,
      page,
      limit,
      total,
      pages,
    };
  }

  async getDisputeById(disputeId: string): Promise<AdminDisputeDetailDTO> {
    if (!Types.ObjectId.isValid(disputeId)) {
      throw new AppError('Invalid disputeId', HttpStatus.BAD_REQUEST);
    }

    const dispute = await this._disputeRepository.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const contractId = dispute.contractId.toString();
    const contract = await this._contractRepository.findDetailByIdForAdmin(contractId);
    if (!contract) {
      throw new AppError(ERROR_MESSAGES.CONTRACT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const scopeId = dispute.scope === 'milestone' && dispute.scopeId
      ? dispute.scopeId.toString()
      : undefined;

    const holdTransaction = await this._contractTransactionRepository.findHoldTransactionByContract(
      contractId,
      scopeId,
    );

    return mapDisputeToAdminDetailDTO(dispute, contract, holdTransaction);
  }

  async splitDisputeFunds(disputeId: string, data: SplitDisputeFundsDTO): Promise<SplitDisputeFundsResponseDTO> {
    if (!Types.ObjectId.isValid(disputeId)) {
      throw new AppError('Invalid disputeId', HttpStatus.BAD_REQUEST);
    }

    if (data.clientPercentage + data.freelancerPercentage !== 100) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.INVALID_SPLIT_PERCENTAGE, HttpStatus.BAD_REQUEST);
    }

    const dispute = await this._disputeRepository.findDisputeById(disputeId);
    if (!dispute) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (dispute.status === 'resolved') {
      throw new AppError(ERROR_MESSAGES.DISPUTE.ALREADY_RESOLVED, HttpStatus.BAD_REQUEST);
    }

    const contractId = dispute.contractId.toString();
    const scopeId = dispute.scope === 'milestone' && dispute.scopeId
      ? dispute.scopeId.toString()
      : undefined;

    const holdTransaction = await this._contractTransactionRepository.findHoldTransactionByContract(
      contractId,
      scopeId,
    );

    if (!holdTransaction) {
      throw new AppError(ERROR_MESSAGES.DISPUTE.NO_HOLD_TRANSACTION, HttpStatus.NOT_FOUND);
    }

    const totalHeldAmount = holdTransaction.amount;
    const clientRefundAmount = (totalHeldAmount * data.clientPercentage) / 100;
    const freelancerReleaseAmount = (totalHeldAmount * data.freelancerPercentage) / 100;

    await this._contractTransactionRepository.updateHoldTransactionStatusToSplit(
      (holdTransaction._id as Types.ObjectId).toString(),
      clientRefundAmount,
      freelancerReleaseAmount,
    );

    await this._disputeRepository.updateDisputeStatus(disputeId, 'resolved');

    return {
      success: true,
      message: 'Funds have been split successfully',
      clientRefundAmount,
      freelancerReleaseAmount,
    };
  }
}
