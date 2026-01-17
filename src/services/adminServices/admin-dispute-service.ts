import { injectable, inject } from 'tsyringe';
import { IAdminDisputeService } from './interfaces/admin-dispute-service.interface';
import { IDisputeRepository } from '../../repositories/interfaces/dispute-repository.interface';
import {
  AdminDisputeQueryParamsDTO,
  AdminDisputeListResultDTO,
} from '../../dto/adminDTO/admin-dispute.dto';
import { mapDisputeToAdminListItemDTO } from '../../mapper/adminMapper/admin-dispute.mapper';

@injectable()
export class AdminDisputeService implements IAdminDisputeService {
  private _disputeRepository: IDisputeRepository;

  constructor(
    @inject('IDisputeRepository')
    disputeRepository: IDisputeRepository,
  ) {
    this._disputeRepository = disputeRepository;
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
}
