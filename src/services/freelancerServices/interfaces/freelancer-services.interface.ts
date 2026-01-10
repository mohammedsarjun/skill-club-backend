import { EducationDTO } from '../../../dto/user.dto';
import { FetchFreelancerDTO } from '../../../dto/freelancer.dto';
import { CreatePortfolioDto, PortfolioDto } from '../../../dto/portfolio.dto';
import { IExperience, IFreelancerProfile } from '../../../models/interfaces/user.model.interface';
import {
  ExpertiseResponseDTO,
  UpdateExpertiseDTO,
} from '../../../dto/freelancerDTO/freelancer-expertise.dto';
export interface IFreelancerService {
  getFreelancerData(id: string): Promise<FetchFreelancerDTO>;
  updateFreelancerLanguage(
    id: string,
    updateData: { language: { name: string; proficiency: string } },
  ): Promise<Partial<IFreelancerProfile> | undefined>;
  deleteFreelancerLanguage(id: string, languageData: string): Promise<void>;
  createPortfolio(id: string, portfolioData: CreatePortfolioDto): Promise<void>;
  getPortfolio(id: string): Promise<PortfolioDto[] | null>;
  getPortfolioDetail(freelancerId: string, portfolioId: string): Promise<PortfolioDto | null>;
  updateFreelancerDescription(
    freelancerId: string,
    descriptionData: { description: string },
  ): Promise<string | null>;

  updateFreelancerProfessionalRole(
    freelancerId: string,
    professionalRoleData: { professionalRole: string },
  ): Promise<string | null>;

  updateFreelancerHourlyRate(
    freelancerId: string,
    hourlyRateData: {
      hourlyRate: number;
      currency?: 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'SGD' | 'JPY';
    },
  ): Promise<number | null>;

  addFreelancerEducation(
    freelancerId: string,
    educationData: EducationDTO,
  ): Promise<EducationDTO[] | null>;

  deleteFreelancerEducation(freelancerId: string, educationId: string): Promise<void>;

  deleteFreelancerPortfolio(freelancerId: string, portfolioId: string): Promise<void>;

  updateFreelancerWorkHistory(
    freelancerId: string,
    workHistory: IExperience,
  ): Promise<Partial<IFreelancerProfile> | null>;

  deleteFreelancerWorkHistory(freelancerId: string, workHistoryId: string): Promise<void>;

  updateFreelancerExpertise(
    freelancerId: string,
    expertiseData: UpdateExpertiseDTO,
  ): Promise<ExpertiseResponseDTO>;
}
