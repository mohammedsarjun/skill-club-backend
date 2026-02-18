import {
  SubmitWorklogDTO,
  WorklogResponseDTO,
  WorklogListResponseDTO,
  WorklogDetailDTO,
} from '../../../dto/freelancerDTO/freelancer-worklog.dto';
import { WorklogValidationResponseDTO } from '../../../dto/freelancerDTO/freelancer-worklog-validation.dto';
import { RaiseWorklogDisputeDTO } from '../../../dto/freelancerDTO/freelancer-worklog-dispute.dto';
import { DisputeResponseDTO } from '../../../dto/freelancerDTO/freelancer-dispute.dto';

export interface IFreelancerWorklogService {
  submitWorklog(freelancerId: string, data: SubmitWorklogDTO): Promise<WorklogResponseDTO>;
  getWorklogsByContract(freelancerId: string, contractId: string): Promise<WorklogResponseDTO[]>;
  getWorklogsListByContract(
    freelancerId: string,
    contractId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<WorklogListResponseDTO>;
  getWorklogDetail(
    freelancerId: string,
    contractId: string,
    worklogId: string,
  ): Promise<WorklogDetailDTO>;
  checkWorklogValidation(
    freelancerId: string,
    contractId: string,
  ): Promise<WorklogValidationResponseDTO>;
  raiseWorklogDispute(
    freelancerId: string,
    contractId: string,
    data: RaiseWorklogDisputeDTO,
  ): Promise<DisputeResponseDTO>;
}
