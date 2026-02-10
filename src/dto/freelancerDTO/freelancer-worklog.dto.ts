export interface SubmitWorklogDTO {
  contractId: string;
  milestoneId?: string;
  duration: number;
  files: { fileName: string; fileUrl: string }[];
  description?: string;
}

export interface WorklogResponseDTO {
  worklogId: string;
  contractId: string;
  milestoneId?: string;
  freelancerId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  files: { fileName: string; fileUrl: string }[];
  description?: string;
  status: 'submitted' | 'approved' | 'rejected' | 'paid';
  createdAt: Date;
}

export interface WorklogListItemDTO {
  worklogId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  filesCount: number;
  status: 'submitted' | 'approved' | 'rejected' | 'paid';
  submittedAt: Date;
  disputeWindowEndsAt?: Date;
}

export interface WorklogDetailDTO {
  worklogId: string;
  contractId: string;
  milestoneId?: string;
  freelancerId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  files: { fileName: string; fileUrl: string }[];
  description?: string;
  status: 'submitted' | 'approved' | 'rejected' | 'paid';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewMessage?: string;
  disputeWindowEndsAt?: Date;
  disputeRaisedBy?: string;
}

export interface WorklogListResponseDTO {
  items: WorklogListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}
