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
  contractId: string;
  scheduledAt: Date;
  durationMinutes: number;
  agenda: string;
  type: 'recurring' | 'milestone' | 'fixed';
  status: 'proposed' | 'accepted' | 'completed' | 'missed' | 'partial_missed' | 'reschedule_requested' | 'cancelled' | 'rejected' | 'ongoing' | 'rescheduled_requested';
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
