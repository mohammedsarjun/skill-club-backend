import { IWorklog } from '../../models/interfaces/worklog.model.interface';
import { ClientWorklogListItemDTO, ClientWorklogDetailDTO } from '../../dto/clientDTO/client-worklog.dto';

export function mapWorklogToListItemDTO(worklog: IWorklog): ClientWorklogListItemDTO {
  return {
    worklogId: worklog.worklogId,
    startTime: worklog.startTime,
    endTime: worklog.endTime,
    duration: worklog.duration,
    filesCount: worklog.files?.length || 0,
    status: worklog.status,
    submittedAt: worklog.createdAt!,
  };
}

export function mapWorklogToDetailDTO(worklog: IWorklog & { freelancerName?: string }): ClientWorklogDetailDTO {
  return {
    worklogId: worklog.worklogId,
    contractId: worklog.contractId.toString(),
    milestoneId: worklog.milestoneId?.toString(),
    freelancerId: worklog.freelancerId.toString(),
    freelancerName: worklog.freelancerName || '',
    startTime: worklog.startTime,
    endTime: worklog.endTime,
    duration: worklog.duration,
    files: worklog.files || [],
    description: worklog.description,
    status: worklog.status,
    submittedAt: worklog.createdAt!,
    reviewedAt: worklog.reviewedAt,
    reviewMessage: worklog.reviewMessage,
  };
}
