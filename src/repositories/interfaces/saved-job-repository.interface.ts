import BaseRepository from '../baseRepositories/base-repository';
import { ISavedJob } from '../../models/interfaces/saved-job.model.interface';

export interface SavedJobWithJobAggregation {
  _id: string;
  job: {
    _id: string;
    title: string;
    description: string;
    category: { _id: string; name: string } | null;
    specialities: { _id: string; name: string }[];
    skills: { _id: string; name: string }[];
    rateType: 'hourly' | 'fixed';
    hourlyRate?: {
      min: number;
      max: number;
      hoursPerWeek: number;
      estimatedDuration: '1 To 3 Months' | '3 To 6 Months';
    } | null;
    fixedRate?: {
      min: number;
      max: number;
    } | null;
    client: { companyName?: string; country?: string };
    status: string;
    createdAt: Date;
  } | null;
  savedAt: Date;
}

export interface ISavedJobRepository extends BaseRepository<ISavedJob> {
  findByFreelancerAndJob(freelancerId: string, jobId: string): Promise<ISavedJob | null>;
  deleteByFreelancerAndJob(freelancerId: string, jobId: string): Promise<ISavedJob | null>;
  findAllByFreelancer(freelancerId: string): Promise<ISavedJob[]>;
  findWithJobDetails(
    freelancerId: string,
    page: number,
    limit: number,
  ): Promise<SavedJobWithJobAggregation[]>;
  countByFreelancer(freelancerId: string): Promise<number>;
}

export default ISavedJobRepository;
