import {
  FreelancerMeetingListResultDTO,
  FreelancerMeetingListItemDTO,
  FreelancerMeetingQueryParamsDTO,
  FreelancerMeetingDetailDTO,
  AcceptMeetingDTO,
  RequestRescheduleDTO,
  FreelancerMeetingProposalRequestDTO,
  FreelancerMeetingProposalResponseDTO,
} from '../../../dto/freelancerDTO/freelancer-meeting.dto';

export interface IFreelancerMeetingService {
  getAllMeetings(
    freelancerId: string,
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<FreelancerMeetingListResultDTO>;
  getContractMeetings(
    freelancerId: string,
    contractId: string,
  ): Promise<FreelancerMeetingListItemDTO[]>;
  getMeetingDetail(freelancerId: string, meetingId: string): Promise<FreelancerMeetingDetailDTO>;
  acceptMeeting(freelancerId: string, data: AcceptMeetingDTO): Promise<void>;
  requestReschedule(freelancerId: string, data: RequestRescheduleDTO): Promise<void>;
  rejectMeeting(freelancerId: string, data: { meetingId: string; reason: string }): Promise<void>;
  approveReschedule(freelancerId: string, data: { meetingId: string }): Promise<void>;
  declineReschedule(
    freelancerId: string,
    data: { meetingId: string; reason: string },
  ): Promise<void>;
  counterReschedule(
    freelancerId: string,
    data: { meetingId: string; proposedTime: string },
  ): Promise<void>;
  proposeMeeting(
    freelancerId: string,
    contractId: string,
    data: FreelancerMeetingProposalRequestDTO,
  ): Promise<FreelancerMeetingProposalResponseDTO>;
  joinMeeting(
    freelancerId: string,
    meetingId: string,
  ): Promise<{ channelName: string; token: string; appId: string; uid: string }>;
}
