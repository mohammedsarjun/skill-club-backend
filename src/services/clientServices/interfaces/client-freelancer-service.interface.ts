import {
  ClientFreelancerResponseDto,
  FetchClientFreelancerDTO,
  FetchClientFreelancerPortfolioDTO,
  freelancerParams,
} from '../../../dto/clientDTO/client-freelancer.dto';

export interface IClientFreelancerService {
  getAllFreelancers(
    clientUserId: string,
    queryFilter: freelancerParams,
  ): Promise<{ freelancers: ClientFreelancerResponseDto[]; totalCount: number } | null>;
  getFreelancerDetail(
    clientUserId: string,
    freelancerId: string,
  ): Promise<FetchClientFreelancerDTO | null>;
  getFreelancerPortfolio(
    clientUserId: string,
    freelancerId: string,
  ): Promise<FetchClientFreelancerPortfolioDTO[] | null>;
}
