import { Request, Response } from 'express';

export interface IFreelancerController {
  getFreelancerData(req: Request, res: Response): Promise<void>;
  updateFreelancerLanguage(req: Request, res: Response): Promise<void>;
  deleteFreelancerLanguage(req: Request, res: Response): Promise<void>;
  updateFreelancerDescription(req: Request, res: Response): Promise<void>;
  updateFreelancerProfessionalRole(req: Request, res: Response): Promise<void>;
  updateFreelancerHourlyRate(req: Request, res: Response): Promise<void>;
  addFreelancerEducation(req: Request, res: Response): Promise<void>;
  updateFreelancerWorkHistory(req: Request, res: Response): Promise<void>;
  deleteFreelancerWorkHistory(req: Request, res: Response): Promise<void>;
  createPortfolio(req: Request, res: Response): Promise<void>;
  deleteFreelancerPortfolio(req: Request, res: Response): Promise<void>;
  getPortfolio(req: Request, res: Response): Promise<void>;
  getPortfolioDetail(req: Request, res: Response): Promise<void>;
  deleteFreelancerEducation(req: Request, res: Response): Promise<void>;
  updateFreelancerExpertise(req: Request, res: Response): Promise<void>;
}
