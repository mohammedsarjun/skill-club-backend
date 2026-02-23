import { IWorkspaceFile } from '../../models/interfaces/workspace-file.model.interface';

export interface IWorkspaceFileRepository {
  create(fileData: Partial<IWorkspaceFile>): Promise<IWorkspaceFile>;
  findByContractId(contractId: string): Promise<IWorkspaceFile[]>;
  findByFileId(fileId: string): Promise<IWorkspaceFile | null>;
  deleteByFileId(fileId: string): Promise<boolean>;
}
