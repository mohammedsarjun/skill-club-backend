import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import '../../config/container';
import IFreelancerSavedJobService from './interfaces/freelancer-saved-job-service.interface';
import { ISavedJobRepository } from '../../repositories/interfaces/saved-job-repository.interface';
import { FreelancerSavedJobListResultDTO } from '../../dto/freelancerDTO/freelancer-saved-job.dto';
import { mapSavedJobAggToListItemDTO } from '../../mapper/freelancerMapper/freelancer-saved-job.mapper';

@injectable()
export class FreelancerSavedJobService implements IFreelancerSavedJobService {
  private _savedJobRepository: ISavedJobRepository;

  constructor(@inject('ISavedJobRepository') savedJobRepository: ISavedJobRepository) {
    this._savedJobRepository = savedJobRepository;
  }

  async toggleSaveJob(freelancerId: string, jobId: string): Promise<{ saved: boolean }> {
    const existing = await this._savedJobRepository.findByFreelancerAndJob(freelancerId, jobId);
    if (existing) {
      await this._savedJobRepository.deleteByFreelancerAndJob(freelancerId, jobId);
      return { saved: false };
    }

    await this._savedJobRepository.create({
      freelancerId: new mongoose.Types.ObjectId(freelancerId),
      jobId: new mongoose.Types.ObjectId(jobId),
    });
    return { saved: true };
  }

  async isJobSaved(freelancerId: string, jobId: string): Promise<boolean> {
    const existing = await this._savedJobRepository.findByFreelancerAndJob(freelancerId, jobId);
    return !!existing;
  }

  async getSavedJobIds(freelancerId: string): Promise<string[]> {
    const saved = await this._savedJobRepository.findAllByFreelancer(freelancerId);
    return saved.map((s) => s.jobId.toString());
  }

  async getSavedJobs(
    freelancerId: string,
    query: { page?: number; limit?: number },
  ): Promise<FreelancerSavedJobListResultDTO> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const [itemsAgg, total] = await Promise.all([
      this._savedJobRepository.findWithJobDetails(freelancerId, page, limit),
      this._savedJobRepository.countByFreelancer(freelancerId),
    ]);

    const items = itemsAgg.map(mapSavedJobAggToListItemDTO);
    const pages = Math.max(1, Math.ceil(total / limit));
    return { items, page, limit, total, pages };
  }
}

export default FreelancerSavedJobService;
