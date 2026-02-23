import { Document, Types } from 'mongoose';

export interface IWorkspaceFile extends Document {
  contractId: string;
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy: string | Types.ObjectId;
  uploadedAt: Date;
}
