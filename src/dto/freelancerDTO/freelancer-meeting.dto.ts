export interface FreelancerMeetingListItemDTO {
  meetingId: string;
  contractId?: string;
  contractTitle?: string;
  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;
  meetingType: 'pre-contract' | 'post-contract';
  status: 'proposed' | 'accepted' | 'completed' | 'missed' | 'partial_missed' | 'reschedule_requested' | 'cancelled' | 'rejected' | 'ongoing' | 'rescheduled_requested';
  client?: {
    clientId: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    logo?: string;
  };
  agora?: {
    channelName: string;
    createdAt: Date;
  };
  attendance?: {
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
  isProposedByFreelancer?: boolean;
  meetingLink?: string;
  createdAt: Date;
}

export interface FreelancerMeetingListResultDTO {
  items: FreelancerMeetingListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface FreelancerMeetingQueryParamsDTO {
  page?: number;
  limit?: number;
  status?: 'proposed' | 'accepted' | 'completed' | 'missed' | 'partial_missed' | 'reschedule_requested';
  meetingType?: 'pre-contract' | 'post-contract';
  requestedBy?: 'client' | 'freelancer';
  rescheduleRequestedBy?: 'client' | 'freelancer';
  isExpired?: boolean;
}

export interface FreelancerMeetingDetailDTO {
  meetingId: string;
  contractId: string;
  contractTitle: string;
  type: 'recurring' | 'milestone' | 'fixed';
  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;
  status: 'ongoing'|'proposed' | 'accepted' | 'completed' | 'missed' | 'partial_missed' | 'reschedule_requested';
  client?: {
    clientId: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    logo?: string;
  };
  milestoneId?: string;
  milestoneTitle?: string;
  milestoneAmount?: number;
  deliverableId?: string;
  deliverableVersion?: number;
  rescheduleRequestedBy?: string;
  rescheduleProposedTime?: Date;
  notes?: {
    clientNotes?: string;
    freelancerNotes?: string;
  };
  isProposedByFreelancer?: boolean;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcceptMeetingDTO {
  meetingId: string;
}

export interface RequestRescheduleDTO {
  meetingId: string;
  proposedTime: Date;
}

export interface RejectMeetingDTO {
  meetingId: string;
  reason: string;
}

export interface FreelancerMeetingProposalRequestDTO {
  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;
  type: 'milestone' | 'fixed';
  milestoneId?: string;
  deliverableId?: string;
}

export interface FreelancerMeetingProposalResponseDTO {
  meetingId: string;
  contractId: string;
  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;
  type: 'milestone' | 'fixed';
  status:'ongoing'| 'proposed' | 'accepted' | 'completed' | 'missed' | 'partial_missed' | 'reschedule_requested';
  createdAt: Date;
}
