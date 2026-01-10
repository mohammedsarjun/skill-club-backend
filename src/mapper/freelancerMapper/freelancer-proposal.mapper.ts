import { Types } from 'mongoose';
import {
  CreateProposalRequestDto,
  FreelancerProposalResponseDTO,
} from '../../dto/freelancerDTO/freelancer-proposal.dto';
import {
  ProposalDetail,
  ProposalDetailWithJobDetail,
} from '../../models/interfaces/proposal.model.interface';

export function mapCreateProposalRequestDtoToProposalModel(
  createProposalRequestDto: CreateProposalRequestDto,
  rateType: 'hourly' | 'fixed',
  freelancerId: string,
): ProposalDetail {
  return {
    freelancerId: new Types.ObjectId(freelancerId),
    jobId: new Types.ObjectId(createProposalRequestDto.jobId),
    hourlyRate: rateType == 'hourly' ? createProposalRequestDto.hourlyRate : undefined,
    availableHoursPerWeek:
      rateType == 'hourly' ? createProposalRequestDto.availableHoursPerWeek : undefined,
    proposedBudget: rateType == 'fixed' ? createProposalRequestDto.proposedBudget : undefined,
    deadline: rateType == 'fixed' ? createProposalRequestDto.deadline : undefined,
    coverLetter: createProposalRequestDto.coverLetter,
    status: 'pending_verification',
  };
}

export const mapProposalModelToFreelancerProposalResponseDTO = (
  rawProposalData: ProposalDetailWithJobDetail,
): FreelancerProposalResponseDTO => {
  console.log(rawProposalData);
  return {
    proposalId: rawProposalData?._id?.toString()!,
    jobDetail: {
      _id: rawProposalData.jobDetail._id.toString(),
      title: rawProposalData.jobDetail.title,
      description: rawProposalData.jobDetail.description,
      clientId: rawProposalData.jobDetail.clientId.toString(),
    },
    hourlyRate: rawProposalData.hourlyRate!,
    availableHoursPerWeek: rawProposalData.availableHoursPerWeek!,
    coverLetter: rawProposalData.coverLetter,
    status: rawProposalData.status,
    proposedAt: rawProposalData.createdAt!,
    proposedBudget: rawProposalData?.proposedBudget,
    deadline: rawProposalData?.deadline,
  };
};
