import { AdminReportedJobResponseDTO } from '../../dto/adminDTO/admin-reported-job.dto';
import { IReportedJob } from '../../models/interfaces/reported-job.model.interface';

export function mapReportedJobToAdminDTO(report: IReportedJob): AdminReportedJobResponseDTO {
  const freelancer =
    typeof report.freelancerId === 'object'
      ? (report.freelancerId as unknown as {
          _id: unknown;
          firstName?: string;
          lastName?: string;
          email?: string;
          profilePicture?: string;
        })
      : null;
  const job =
    typeof report.jobId === 'object'
      ? (report.jobId as unknown as { _id: unknown; title?: string; status?: string })
      : null;

  return {
    reportId: report._id?.toString() || '',
    jobId: job?._id?.toString() || report.jobId?.toString() || '',
    jobTitle: job?.title || '',
    jobStatus: job?.status || '',
    freelancerId: freelancer?._id?.toString() || report.freelancerId?.toString() || '',
    freelancerName: freelancer
      ? `${freelancer.firstName || ''} ${freelancer.lastName || ''}`.trim()
      : '',
    freelancerEmail: freelancer?.email || '',
    freelancerPicture: freelancer?.profilePicture || '',
    reason: report.reason,
    reportedAt: report.createdAt,
  };
}
