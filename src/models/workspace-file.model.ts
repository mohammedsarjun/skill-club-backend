import mongoose, { Schema } from 'mongoose';
import { IWorkspaceFile } from './interfaces/workspace-file.model.interface';

const WorkspaceFileSchema = new Schema<IWorkspaceFile>(
  {
    contractId: { type: String, required: true, index: true },
    fileId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    fileType: { type: String },
    uploadedBy: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const WorkspaceFile = mongoose.model<IWorkspaceFile>('WorkspaceFile', WorkspaceFileSchema);
