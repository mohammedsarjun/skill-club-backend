import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientFreelancerService } from './interfaces/client-freelancer-service.interface';
import { IFreelancerRepository } from '../../repositories/interfaces/freelancer-repository.interface';
import {
  ClientFreelancerResponseDto,
  FetchClientFreelancerDTO,
  FetchClientFreelancerPortfolioDTO,
  freelancerParams,
} from '../../dto/clientDTO/client-freelancer.dto';
import {
  mapFreelancerToFetchClientFreelancerDTO,
  mapPortfolioToFetchClientPortfolioDTO,
  mapUserModelToClientFreelancerResponseDto,
} from '../../mapper/clientMapper/client-freelancer.mapper';
import { IFreelancerData } from '../../models/interfaces/user.model.interface';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { IPortfolioRepository } from '../../repositories/interfaces/portfolio-respository.interface';
import { IReviewRepository } from '../../repositories/interfaces/review-repository.interface';

@injectable()
export class ClientFreelancerService implements IClientFreelancerService {
  private _freelancerRepository: IFreelancerRepository;
  private _portfolioRepository: IPortfolioRepository;
  private _reviewRepository: IReviewRepository;
  constructor(
    @inject('IFreelancerRepository') freelancerRepository: IFreelancerRepository,
    @inject('IPortfolioRepository') portfolioRepository: IPortfolioRepository,
    @inject('IReviewRepository') reviewRepository: IReviewRepository,
  ) {
    this._freelancerRepository = freelancerRepository;
    this._portfolioRepository = portfolioRepository;
    this._reviewRepository = reviewRepository;
  }

  async getAllFreelancers(
    clientUserId: string,
    queryFilter: freelancerParams,
  ): Promise<{ freelancers: ClientFreelancerResponseDto[]; totalCount: number } | null> {
    const repoResult = await this._freelancerRepository.getAllFreelancers(
      clientUserId,
      queryFilter,
    );

    if (!repoResult) return null;

    const freelancersArray: IFreelancerData[] = repoResult ?? [];

    const mapped = freelancersArray.map(mapUserModelToClientFreelancerResponseDto);

    const totalCount = await this._freelancerRepository.countAllFreelancers();

    return { freelancers: mapped, totalCount };
  }

  async getFreelancerDetail(
    clientUserId: string,
    freelancerId: string,
  ): Promise<FetchClientFreelancerDTO | null> {
    if (clientUserId == freelancerId) {
      throw new AppError('You cannot view your own freelancer profile.', HttpStatus.BAD_REQUEST);
    }
    const freelancerData = await this._freelancerRepository.getFreelacerByIdForClient(freelancerId);

    const averageRating = await this._reviewRepository.getAverageRatingByFreelancerId(freelancerId);
    const { total } = await this._reviewRepository.findReviewsByFreelancerId(freelancerId, 1, 1);

    const freelancerDto = mapFreelancerToFetchClientFreelancerDTO(
      freelancerData!,
      averageRating,
      total,
    );

    return freelancerDto;
  }

  async getFreelancerPortfolio(
    clientUserId: string,
    freelancerId: string,
  ): Promise<FetchClientFreelancerPortfolioDTO[] | null> {
    if (clientUserId == freelancerId) {
      throw new AppError('You cannot view your own freelancer porfolio.', HttpStatus.BAD_REQUEST);
    }
    const portfolioData = await this._portfolioRepository.getPortfolioByFreelancerId(freelancerId);
    const portfolioDto = portfolioData?.map(mapPortfolioToFetchClientPortfolioDTO);
    return portfolioDto ? portfolioDto : null;
  }
}
