import BaseRepository from '../baseRepositories/base-repository';
import { ISavedFreelancer } from '../../models/interfaces/saved-freelancer.model.interface';

export interface ISavedFreelancerRepository extends BaseRepository<ISavedFreelancer> {
  findByClientAndFreelancer(
    clientId: string,
    freelancerId: string,
  ): Promise<ISavedFreelancer | null>;
  deleteByClientAndFreelancer(
    clientId: string,
    freelancerId: string,
  ): Promise<ISavedFreelancer | null>;
  findAllByClient(clientId: string): Promise<ISavedFreelancer[]>;
  findWithFreelancerDetails(
    clientId: string,
    page: number,
    limit: number,
  ): Promise<
    {
      _id: string; // saved doc id
      savedAt: Date;
      freelancer: {
        _id: string;
        firstName?: string;
        lastName?: string;
        logo?: string;
        professionalRole?: string;
        country?: string;
        hourlyRate?: number;
        skills: string[];
      } | null;
    }[]
  >;
  countByClient(clientId: string): Promise<number>;
}

export default ISavedFreelancerRepository;
