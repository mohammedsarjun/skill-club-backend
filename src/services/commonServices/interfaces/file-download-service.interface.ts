import { FileDownloadInput } from "../../../dto/files-download.dto";
import archiver from "archiver";
export interface IFileDownloadService {
    getDeliverablesZip(files: FileDownloadInput[]):archiver.Archiver;
}
