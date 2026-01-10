import { injectable, inject } from 'tsyringe';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { IAdminContractService } from './interfaces/admin-contract-service.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import {
  AdminContractQueryParamsDTO,
  AdminContractListResultDTO,
  AdminContractDetailDTO,
} from '../../dto/adminDTO/admin-contract.dto';
import {
  mapContractToAdminListItemDTO,
  mapContractToAdminDetailDTO,
} from '../../mapper/adminMapper/admin-contract.mapper';

@injectable()
export class AdminContractService implements IAdminContractService {
  private _contractRepository: IContractRepository;

  constructor(
    @inject('IContractRepository')
    contractRepository: IContractRepository,
  ) {
    this._contractRepository = contractRepository;
  }

  async getAllContracts(query: AdminContractQueryParamsDTO): Promise<AdminContractListResultDTO> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const contracts = await this._contractRepository.findAllForAdmin(query);
    const total = await this._contractRepository.countForAdmin(query);

    const items = contracts.map(mapContractToAdminListItemDTO);
    const pages = Math.ceil(total / limit);

    return {
      items,
      page,
      limit,
      total,
      pages,
    };
  }

  async getContractDetail(contractId: string): Promise<AdminContractDetailDTO> {
    const contract = await this._contractRepository.findDetailByIdForAdmin(contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    return mapContractToAdminDetailDTO(contract);
  }
}
