export interface SubmitMilestoneDeliverableDTO {
  milestoneId: string;
  files: { fileName: string; fileUrl: string }[];
  message?: string;
}

export interface RequestMilestoneExtensionDTO {
  milestoneId: string;
  requestedDeadline: Date;
  reason: string;
}

export interface MilestoneDeliverableResponseDTO {
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

export interface MilestoneExtensionResponseDTO {
  requestedBy: string;
  requestedDeadline: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  respondedAt?: string;
  responseMessage?: string;
}
