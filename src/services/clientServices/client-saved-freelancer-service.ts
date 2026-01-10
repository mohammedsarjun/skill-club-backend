import { injectable, inject } from 'tsyringe';
import '../../config/container';
import IClientSavedFreelancerService from './interfaces/client-saved-freelancer-service.interface';
import { ISavedFreelancerRepository } from '../../repositories/interfaces/saved-freelancer-repository.interface';
import mongoose from 'mongoose';
import { ClientSavedFreelancerListResultDTO } from '../../dto/clientDTO/client-saved-freelancer.dto';
import { mapSavedFreelancerAggToDTO } from '../../mapper/clientMapper/client-saved-freelancer.mapper';

@injectable()
export class ClientSavedFreelancerService implements IClientSavedFreelancerService {
  private _savedFreelancerRepository: ISavedFreelancerRepository;

  constructor(
    @inject('ISavedFreelancerRepository') savedFreelancerRepository: ISavedFreelancerRepository,
  ) {
    this._savedFreelancerRepository = savedFreelancerRepository;
  }

  async toggleSaveFreelancer(clientId: string, freelancerId: string): Promise<{ saved: boolean }> {
    const existing = await this._savedFreelancerRepository.findByClientAndFreelancer(
      clientId,
      freelancerId,
    );
    if (existing) {
      await this._savedFreelancerRepository.deleteByClientAndFreelancer(clientId, freelancerId);
      return { saved: false };
    }

    await this._savedFreelancerRepository.create({
      clientId: new mongoose.Types.ObjectId(clientId),
      freelancerId: new mongoose.Types.ObjectId(freelancerId),
    });

    return { saved: true };
  }

  async isFreelancerSaved(clientId: string, freelancerId: string): Promise<boolean> {
    const existing = await this._savedFreelancerRepository.findByClientAndFreelancer(
      clientId,
      freelancerId,
    );
    return !!existing;
  }

  async getSavedFreelancers(
    clientId: string,
    query: { page?: number; limit?: number },
  ): Promise<ClientSavedFreelancerListResultDTO> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 12;
    const [rows, total] = await Promise.all([
      this._savedFreelancerRepository.findWithFreelancerDetails(clientId, page, limit),
      this._savedFreelancerRepository.countByClient(clientId),
    ]);
    const items = rows.map(mapSavedFreelancerAggToDTO);
    const pages = Math.max(1, Math.ceil(total / limit));
    return { items, page, limit, total, pages };
  }
}

export default ClientSavedFreelancerService;
