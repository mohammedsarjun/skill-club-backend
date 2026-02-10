import { IWorklog } from '../../models/interfaces/worklog.model.interface';
import { WorklogResponseDTO, WorklogListItemDTO, WorklogDetailDTO } from '../../dto/freelancerDTO/freelancer-worklog.dto';

export function mapWorklogToResponseDTO(worklog: IWorklog): WorklogResponseDTO {
  return {
    worklogId: worklog.worklogId,
    contractId: worklog.contractId.toString(),
    milestoneId: worklog.milestoneId?.toString(),
    freelancerId: worklog.freelancerId.toString(),
    startTime: worklog.startTime,
    endTime: worklog.endTime,
    duration: worklog.duration,
    files: worklog.files,
    description: worklog.description,
    status: worklog.status,
    createdAt: worklog.createdAt || new Date(),
  };
}

export function mapWorklogToListItemDTO(worklog: IWorklog): WorklogListItemDTO {
  return {
    worklogId: worklog.worklogId,
    startTime: worklog.startTime,
    endTime: worklog.endTime,
    duration: worklog.duration,
    filesCount: worklog.files.length,
    status: worklog.status,
    submittedAt: worklog.createdAt || new Date(),
    disputeWindowEndsAt: worklog.disputeWindowEndDate,
  };
}

export function mapWorklogToDetailDTO(worklog: IWorklog, disputeRaisedBy?: string): WorklogDetailDTO {
  return {
    worklogId: worklog.worklogId,
    contractId: worklog.contractId.toString(),
    milestoneId: worklog.milestoneId?.toString(),
    freelancerId: worklog.freelancerId.toString(),
    startTime: worklog.startTime,
    endTime: worklog.endTime,
    duration: worklog.duration,
    files: worklog.files,
    description: worklog.description,
    status: worklog.status,
    submittedAt: worklog.createdAt || new Date(),
    reviewedAt: worklog.reviewedAt,
    reviewMessage: worklog.reviewMessage,
    disputeWindowEndsAt: worklog.disputeWindowEndDate,
    disputeRaisedBy,
  };
}
