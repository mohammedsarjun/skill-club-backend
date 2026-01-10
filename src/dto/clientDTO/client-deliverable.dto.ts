export interface ApproveDeliverableDTO {
  deliverableId: string;
  message?: string;
}

export interface RequestChangesDTO {
  deliverableId: string;
  message: string;
}

export interface RequestChangesDTO {
  deliverableId: string;
  message: string;
}

export interface DownloadDeliverableDTO {
  deliverableId: string;
}

export interface DeliverableResponseDTO {
  id: string;
  submittedBy: string;
  files: { fileName: string; fileUrl: string }[];
  message?: string;
  status: 'submitted' | 'approved' | 'changes_requested';
  version: number;
  submittedAt: string;
  approvedAt?: string;
  revisionsRequested?: number;
  revisionsAllowed?: number;
  revisionsLeft?: number;
}
