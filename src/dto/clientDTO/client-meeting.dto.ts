export interface ClientMeetingProposalRequestDTO {
  scheduledAt: string;
  durationMinutes: number;
  agenda: string;

  milestoneId?: string;
  deliverableId?: string;
}

export interface ClientMeetingProposalResponseDTO {
  meetingId: string;
  contractId: string;
  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;

  type?: 'milestone' | 'fixed';
  status: string;
  createdAt: Date;
}

export interface ClientMeetingListItemDTO {
  meetingId: string;
  contractId?: string;
  contractTitle?: string;
  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;
  type?: 'recurring' | 'milestone' | 'fixed';
  meetingType: 'pre-contract' | 'post-contract';
  status: 'proposed' | 'accepted' | 'completed' | 'missed' | 'partial_missed' | 'reschedule_requested' | 'cancelled' | 'rejected' | 'ongoing' | 'rescheduled_requested';
  freelancer?: {
    freelancerId: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
  agora?: {
    channelName: string;
    createdAt: Date;
  };
  attendance: {
    clientJoined: boolean;
    clientLeftAt?: Date;
    freelancerJoined: boolean;
    freelancerLeftAt?: Date;
  };
  notes?: {
    clientNotes?: string;
    freelancerNotes?: string;
  };
  rescheduleRequestedBy?: string;
  rescheduleProposedTime?: Date;
  isProposedByClient: boolean;
  createdAt: Date;
}

export interface ClientMeetingListResultDTO {
  items: ClientMeetingListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ClientMeetingQueryParamsDTO {
  page?: number;
  limit?: number;
  status?: 'proposed' | 'accepted' | 'completed' | 'missed' | 'partial_missed' | 'reschedule_requested' | 'cancelled' | 'rejected' | 'ongoing' | 'rescheduled_requested';
  meetingType?: 'pre-contract' | 'post-contract';
  requestedBy?: 'client' | 'freelancer';
  rescheduleRequestedBy?: 'client' | 'freelancer';
  isExpired?: boolean;
}

export interface ClientPreContractMeetingRequestDTO {
  scheduledAt: string;
  durationMinutes: number;
  agenda: string;
}

export interface ClientPreContractMeetingResponseDTO {
  meetingId: string;
  freelancerId: string;
  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;
  meetingType: 'pre-contract';
  status: string;
  createdAt: Date;
}
