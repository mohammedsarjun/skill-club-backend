export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  format?: string;
  bytes: number;
  secureUrl: string;
  originalFilename?: string;
}

export interface IFileUploadService {
  uploadFile(file: Express.Multer.File, options?: UploadOptions): Promise<UploadResult>;
}
