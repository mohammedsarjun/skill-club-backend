import { injectable } from 'tsyringe';

import { IFileDownloadService } from './interfaces/file-download-service.interface';
import archiver from 'archiver';
import { createZipStream } from '../../utils/zipStream';
import { FileDownloadInput } from '../../dto/files-download.dto';
import { mapFilesToZip } from '../../mapper/file-download.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class FileDownloadService implements IFileDownloadService {
  getDeliverablesZip(files: FileDownloadInput[]): archiver.Archiver {
    if (!files.length) throw new AppError('No files to download', HttpStatus.NOT_FOUND);
    const mappedFiles = mapFilesToZip(files);

    return createZipStream(mappedFiles);
  }
}
