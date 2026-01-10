import { ClientMeetingProposalRequestDTO, ClientMeetingProposalResponseDTO, ClientMeetingListItemDTO } from '../../../dto/clientDTO/client-meeting.dto';

export interface IClientMeetingService {
  proposeMeeting(clientId: string, contractId: string, meetingData: ClientMeetingProposalRequestDTO): Promise<ClientMeetingProposalResponseDTO>;
  acceptMeeting(clientId: string, data: { meetingId: string }): Promise<void>;
  rejectMeeting(clientId: string, data: { meetingId: string; reason: string }): Promise<void>;
  approveReschedule(clientId: string, data: { meetingId: string }): Promise<void>;
  declineReschedule(clientId: string, data: { meetingId: string; reason: string }): Promise<void>;
  requestReschedule(clientId: string, data: { meetingId: string; proposedTime: Date }): Promise<void>;
  getContractMeetings(clientId: string, contractId: string): Promise<ClientMeetingListItemDTO[]>;
  joinMeeting(clientId: string, meetingId: string): Promise<{ channelName: string; token: string;  appId: string; uid: string  }>;
}
