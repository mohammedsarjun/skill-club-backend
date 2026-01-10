import { CreatePortfolioDto } from '../../dto/portfolio.dto';
import { IPortfolio } from '../../models/interfaces/portfolio.model.interface';
import BaseRepository from '../baseRepositories/base-repository';

export interface IPortfolioRepository extends BaseRepository<IPortfolio> {
  createPortfolio(portfolioData: CreatePortfolioDto): Promise<IPortfolio | null>;
  getPortfolioByFreelancerId(freelancerId: string): Promise<IPortfolio[] | null>;
  getPortfolioDetail(freelancerId: string, portfolioId: string): Promise<IPortfolio | null>;
  deletePortfolio(portfolioId: string): Promise<IPortfolio | null>;
  getFreelancerPortfolioById(freelancerId: string, portfolioId: string): Promise<IPortfolio | null>;
}
