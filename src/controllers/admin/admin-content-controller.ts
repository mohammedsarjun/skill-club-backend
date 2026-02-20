import { Request, Response } from 'express';
import type { IAdminContentController } from './interfaces/admin-content-controller.interface';
import { injectable, inject } from 'tsyringe';
import type { IAdminContentService } from '../../services/adminServices/interfaces/admin-content-service.interface';
import '../../config/container';
import { UpdateContentDTO } from '../../dto/adminDTO/admin-content.dto';
import { HttpStatus } from '../../enums/http-status.enum';
import { MESSAGES } from '../../contants/contants';

@injectable()
export class AdminContentController implements IAdminContentController {
  private _adminContentService: IAdminContentService;

  constructor(
    @inject('IAdminContentService')
    adminContentService: IAdminContentService,
  ) {
    this._adminContentService = adminContentService;
  }

  async getAllContents(_req: Request, res: Response): Promise<void> {
    const result = await this._adminContentService.getAllContents();
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CONTENT.FETCH_SUCCESS,
      data: result,
    });
  }

  async getContentBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const result = await this._adminContentService.getContentBySlug(slug);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CONTENT.FETCH_SUCCESS,
      data: result,
    });
  }

  async updateContent(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const dto: UpdateContentDTO = req.body;
    const result = await this._adminContentService.updateContent(slug, dto);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CONTENT.UPDATED,
      data: result,
    });
  }

  async getPublishedContentBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const result = await this._adminContentService.getPublishedContentBySlug(slug);
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CONTENT.FETCH_SUCCESS,
      data: result,
    });
  }

  async getAllPublishedContents(_req: Request, res: Response): Promise<void> {
    const result = await this._adminContentService.getAllPublishedContents();
    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CONTENT.FETCH_SUCCESS,
      data: result,
    });
  }
}
