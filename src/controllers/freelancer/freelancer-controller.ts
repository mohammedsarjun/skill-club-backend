import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IFreelancerController } from './interfaces/freelancer-controller.interface';
import type { IFreelancerService } from '../../services/freelancerServices/interfaces/freelancer-services.interface';
import { MESSAGES } from '../../contants/contants';
import { IFreelancerProfile } from '../../models/interfaces/user.model.interface';
import { SupportedCurrency } from '../../contants/currency.constants';

@injectable()
export class FreelancerController implements IFreelancerController {
  private _freelancerService: IFreelancerService;
  constructor(@inject('IFreelancerService') freelancerService: IFreelancerService) {
    this._freelancerService = freelancerService;
  }

  async getFreelancerData(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const result = await this._freelancerService.getFreelancerData(userId!);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.Freelancer.FETCH_SUCCESS,
      data: result,
    });
  }

  async updateFreelancerLanguage(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const result: Partial<IFreelancerProfile> | undefined =
      await this._freelancerService.updateFreelancerLanguage(userId as string, req.body);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.Freelancer.UPDATED,
      data: result,
    });
  }

  async deleteFreelancerLanguage(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { language } = req.query;
    await this._freelancerService.deleteFreelancerLanguage(userId as string, language as string);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FREELANCER_PROFILE.LANGUAGE_DELETED,
    });
  }

  async createPortfolio(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const portfolioData = req.body.portfolioData;
    await this._freelancerService.createPortfolio(userId as string, portfolioData);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.PORTFOLIO.CREATED,
    });
  }

  async deleteFreelancerPortfolio(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { portfolioId } = req.query;
    await this._freelancerService.deleteFreelancerPortfolio(
      userId as string,
      portfolioId as string,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.PORTFOLIO.DELETED,
    });
  }

  async getPortfolio(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;

    const result = await this._freelancerService.getPortfolio(userId as string);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.PORTFOLIO.FETCH_SUCCESS,
      data: result,
    });
  }

  async getPortfolioDetail(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { portfolioId } = req.query;
    const result = await this._freelancerService.getPortfolioDetail(
      userId as string,
      portfolioId as string,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.PORTFOLIO.FETCH_SUCCESS,
      data: result,
    });
  }

  async updateFreelancerDescription(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const description = req.body.description;
    const result = await this._freelancerService.updateFreelancerDescription(
      userId as string,
      description,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FREELANCER_PROFILE.DESCRIPTION_UPDATED,
      data: result,
    });
  }

  async updateFreelancerProfessionalRole(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const professionalRole = req.body.professionalRole;
    const result = await this._freelancerService.updateFreelancerProfessionalRole(
      userId as string,
      professionalRole,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FREELANCER_PROFILE.ROLE_UPDATED,
      data: result,
    });
  }

  async updateFreelancerHourlyRate(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const hourlyRate: number = req.body.hourlyRate;
    const currency = req.body.currency as SupportedCurrency | undefined;
    const result = await this._freelancerService.updateFreelancerHourlyRate(userId as string, {
      hourlyRate,
      currency,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FREELANCER_PROFILE.HOURLY_RATE_UPDATED,
      data: result,
    });
  }

  async addFreelancerEducation(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const education = req.body.education;
    const result = await this._freelancerService.addFreelancerEducation(
      userId as string,
      education,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FREELANCER_PROFILE.EDUCATION_UPDATED,
      data: result,
    });
  }

  async deleteFreelancerEducation(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const educationId = req.query.educationId;
    const result = await this._freelancerService.deleteFreelancerEducation(
      userId as string,
      educationId as string,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FREELANCER_PROFILE.EDUCATION_DELETED,
      data: result,
    });
  }

  async updateFreelancerWorkHistory(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const workHistory = req.body.workHistory;
    const result = await this._freelancerService.updateFreelancerWorkHistory(
      userId as string,
      workHistory,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Freelancer Work History Updated Succcessfully',
      data: result,
    });
  }

  async deleteFreelancerWorkHistory(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const workHistoryId = req.query.workHistoryId;
    const result = await this._freelancerService.deleteFreelancerWorkHistory(
      userId as string,
      workHistoryId as string,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Freelancer Work History Deleted Succcessfully',
      data: result,
    });
  }

  async updateFreelancerExpertise(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { category, specialities, skills } = req.body;

    const result = await this._freelancerService.updateFreelancerExpertise(userId as string, {
      category,
      specialities,
      skills,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Expertise updated successfully',
      data: result,
    });
  }
  async updateFreelancerLogo(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { logo } = req.body;
    const result = await this._freelancerService.updateFreelancerLogo(userId as string, logo);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FREELANCER_PROFILE.LOGO_UPDATED,
      data: result,
    });
  }

  async updateFreelancerName(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { name } = req.body;
    const result = await this._freelancerService.updateFreelancerName(userId as string, name);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.FREELANCER_PROFILE.NAME_UPDATED,
      data: result,
    });
  }
}
