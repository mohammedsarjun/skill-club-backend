export interface FileDownloadInput {
  url: string;
  originalName: string;
  folder?: string; // optional subfolder inside ZIP
}