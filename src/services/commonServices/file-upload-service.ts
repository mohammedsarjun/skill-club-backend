import { injectable } from 'tsyringe';
import { cloudinary } from '../../config/cloudinary';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import type {
  IFileUploadService,
  UploadOptions,
  UploadResult,
} from './interfaces/file-upload-service.interface';

@injectable()
export class FileUploadService implements IFileUploadService {
  async uploadFile(file: Express.Multer.File, options: UploadOptions = {}): Promise<UploadResult> {
    if (!file) {
      throw new AppError('File is required', HttpStatus.BAD_REQUEST);
    }

    const folder = options.folder ?? 'uploads';
    const resourceType = options.resourceType ?? 'auto';

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new AppError('Unknown cloudinary response', HttpStatus.INTERNAL_SERVER_ERROR));
          }
        },
      );

      uploadStream.end(file.buffer);
    }).catch((error) => {
      if (error instanceof AppError) {
        throw error;
      }
      const message = (error as UploadApiErrorResponse)?.message ?? 'Cloudinary upload failed';
      throw new AppError(message, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    return {
      url: uploadResult.secure_url,
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      resourceType: uploadResult.resource_type,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      originalFilename: uploadResult.original_filename ?? undefined,
    };
  }
}
