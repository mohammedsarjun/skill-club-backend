export interface SubmitDeliverableDTO {
  files: { fileName: string; fileUrl: string }[];
  message?: string;
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
