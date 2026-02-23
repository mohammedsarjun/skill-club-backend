import BaseRepository from './baseRepositories/base-repository';
import { IWorkspaceFile } from '../models/interfaces/workspace-file.model.interface';
import { WorkspaceFile } from '../models/workspace-file.model';
import { IWorkspaceFileRepository } from './interfaces/workspace-file.repository.interface';
import { injectable } from 'tsyringe';

@injectable()
export class WorkspaceFileRepository extends BaseRepository<IWorkspaceFile> implements IWorkspaceFileRepository {
  constructor() {
    super(WorkspaceFile);
  }

  async create(fileData: Partial<IWorkspaceFile>): Promise<IWorkspaceFile> {
    return await super.create(fileData);
  }

  async findByContractId(contractId: string): Promise<IWorkspaceFile[]> {
    return await super.findAll({ contractId });
  }

  async findByFileId(fileId: string): Promise<IWorkspaceFile | null> {
    return await super.findOne({ fileId });
  }

  async deleteByFileId(fileId: string): Promise<boolean> {
    const result = await WorkspaceFile.deleteOne({ fileId });
    return result.deletedCount > 0;
  }
}
