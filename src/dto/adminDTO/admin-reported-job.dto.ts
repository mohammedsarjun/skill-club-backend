export interface AdminReportedJobResponseDTO {
  reportId: string;
  jobId: string;
  jobTitle: string;
  jobStatus: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerPicture: string;
  reason: string;
  reportedAt: Date;
}

export interface PaginatedAdminReportedJobDTO {
  data: AdminReportedJobResponseDTO[];
  total: number;
  page: number;
  limit: number;
}

export interface JobReportsResponseDTO {
  reports: AdminReportedJobResponseDTO[];
  totalReports: number;
}
