import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { HttpStatus } from '../../enums/http-status.enum';
import { IClientCategoryController } from './interfaces/client-category-controller.interface';
import { IClientCategoryService } from '../../services/clientServices/interfaces/client-category-service.interface';
import { MESSAGES } from '../../contants/contants';
import { GetClientCategoryDTO } from '../../dto/clientDTO/client-category.dto';

@injectable()
export class ClientCategoryController implements IClientCategoryController {
  private _clientCategoryService: IClientCategoryService;
  constructor(@inject('IClientCategoryService') clientCategoryService: IClientCategoryService) {
    this._clientCategoryService = clientCategoryService;
  }

  async getAllCategories(_req: Request, res: Response): Promise<void> {
    const categoryData: GetClientCategoryDTO[] =
      await this._clientCategoryService.getAllCategories();

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.CATEGORY.FETCH_SUCCESS,
      data: categoryData,
    });
  }
}
