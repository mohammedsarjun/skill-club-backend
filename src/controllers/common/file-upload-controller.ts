import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { HttpStatus } from '../../enums/http-status.enum';
import AppError from '../../utils/app-error';
import type {
  IFileUploadService,
  UploadOptions,
} from '../../services/commonServices/interfaces/file-upload-service.interface';

@injectable()
export class FileUploadController {
  constructor(
    @inject('IFileUploadService') private readonly fileUploadService: IFileUploadService,
  ) {}

  async uploadSingle(req: Request, res: Response): Promise<void> {
    const file = (req as Request & { file?: Express.Multer.File }).file;

    if (!file) {
      throw new AppError('No file provided', HttpStatus.BAD_REQUEST);
    }

    const options: UploadOptions = {
      folder: typeof req.body.folder === 'string' && req.body.folder ? req.body.folder : undefined,
      resourceType:
        typeof req.body.resourceType === 'string' && req.body.resourceType
          ? (req.body.resourceType as UploadOptions['resourceType'])
          : undefined,
    };

    const result = await this.fileUploadService.uploadFile(file, options);

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
    });
  }
}
