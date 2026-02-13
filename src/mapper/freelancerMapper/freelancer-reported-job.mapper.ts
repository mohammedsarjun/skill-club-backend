import { ReportJobResponseDTO } from '../../dto/freelancerDTO/freelancer-reported-job.dto';

export function mapToReportJobResponseDTO(reported: boolean): ReportJobResponseDTO {
  return {
    reported,
    message: reported ? 'Job reported successfully' : 'Report removed successfully',
  };
}
