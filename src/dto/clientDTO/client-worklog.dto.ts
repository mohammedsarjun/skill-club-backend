export interface ClientWorklogQueryParamsDTO {
  page?: number;
  limit?: number;
  status?: 'submitted' | 'approved' | 'rejected';
}

export interface WorklogFileDTO {
  fileName: string;
  fileUrl: string;
}

export interface ClientWorklogListItemDTO {
  worklogId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  filesCount: number;
  status: 'submitted' | 'approved' | 'rejected' | 'paid';
  submittedAt: Date;
}

export interface ClientWorklogDetailDTO {
  worklogId: string;
  contractId: string;
  milestoneId?: string;
  freelancerId: string;
  freelancerName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  files: WorklogFileDTO[];
  description?: string;
  status: 'submitted' | 'approved' | 'rejected' | 'paid';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewMessage?: string;
}

export interface ClientWorklogListResultDTO {
  items: ClientWorklogListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApproveWorklogDTO {
  worklogId: string;
  message?: string;
}

export interface RejectWorklogDTO {
  worklogId: string;
  message: string;
}