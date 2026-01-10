import BaseRepository from '../baseRepositories/base-repository';
import {
  IExperience,
  IFreelancerData,
  IFreelancerDetailData,
  IUser,
} from '../../models/interfaces/user.model.interface';
import { IEducationDTO, UpdateLanguageDTO } from '../../dto/freelancer.dto';
import { freelancerParams } from '../../dto/clientDTO/client-freelancer.dto';

export interface IFreelancerRepository extends BaseRepository<IUser> {
  getFreelancerById(userId: string): Promise<
    | (Omit<
        IUser,
        | 'freelancerProfile.workCategory'
        | 'freelancerProfile.specialties'
        | 'freelancerProfile.skills'
      > & {
        freelancerProfile: {
          workCategory: { _id: string; name: string };
          specialties: { _id: string; name: string }[];
          skills: { _id: string; name: string }[];
        };
      })
    | null
  >;
  updateFreelancerProfile(userId: string, data: Record<string, unknown>): Promise<IUser | null>;
  addLanguageToFreelancerProfile(
    userId: string,
    language: UpdateLanguageDTO,
  ): Promise<IUser | null>;
  addEducationToFreelancerProfile(userId: string, education: IEducationDTO): Promise<IUser | null>;
  deleteLanguageFromFreelancerProfile(userId: string, language: string): Promise<IUser | null>;
  deleteEducationFromFreelancerProfile(userId: string, educationId: string): Promise<IUser | null>;
  addWorkExperienceToFreelancerProfile(
    userId: string,
    workHistory: IExperience,
  ): Promise<IUser | null>;
  deleteWorkExperienceFromFreelancerProfile(
    userId: string,
    workHistoryId: string,
  ): Promise<IUser | null>;
  updateFreelancerExpertise(
    userId: string,
    category: string,
    specialities: string[],
    skills: string[],
  ): Promise<IUser | null>;

  getAllFreelancers(
    clientUserId: string,
    queryFilter: freelancerParams,
  ): Promise<IFreelancerData[] | null>;
  getFreelacerByIdForClient(freelancerId: string): Promise<IFreelancerDetailData | null>;
  countAllFreelancers(): Promise<number>;
}
