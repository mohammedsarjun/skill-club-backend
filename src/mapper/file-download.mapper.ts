import { FileDownloadInput } from 'src/dto/files-download.dto';

interface FileToZip {
  url: string;
  path: string;
}

export function mapFilesToZip(files: FileDownloadInput[]): FileToZip[] {
  return files.map((f) => ({
    url: f.url,
    path: f.folder ? `${f.folder}/${f.originalName}` : f.originalName,
  }));
}
