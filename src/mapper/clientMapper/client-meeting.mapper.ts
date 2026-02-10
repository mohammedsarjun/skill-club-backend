import { IMeeting } from '../../models/interfaces/meeting.model.interface';
import { IContract } from '../../models/interfaces/contract.model.interface';
import { ClientMeetingProposalResponseDTO, ClientMeetingListItemDTO } from '../../dto/clientDTO/client-meeting.dto';
import { IUser } from '../../models/interfaces/user.model.interface';
import { Types } from 'mongoose';

function docIdToString(id: unknown): string | undefined {
  if (!id) return undefined;
  if (typeof id === 'string') return id;
  if (id instanceof Types.ObjectId) return id.toString();
  if (
    typeof id === 'object' &&
    id !== null &&
    'toString' in id &&
    typeof (id as { toString: unknown }).toString === 'function'
  ) {
    return (id as { toString(): string }).toString();
  }
  return undefined;
}

function isPopulatedUser(freelancerId: Types.ObjectId | IUser): freelancerId is IUser {
  return freelancerId && typeof freelancerId === 'object' && 'firstName' in freelancerId;
}

export const mapMeetingToClientMeetingProposalResponseDTO = (meeting: IMeeting): ClientMeetingProposalResponseDTO => {
  const rawObj = meeting as unknown as Record<string, unknown>;
  const rawId = docIdToString(rawObj._id) || docIdToString(rawObj.id) || '';

  return {
    meetingId: rawId,
    contractId: meeting.contractId?.toString() || '',
    scheduledAt: meeting.scheduledAt,
    durationMinutes: meeting.durationMinutes,
    agenda: meeting.agenda,
    type: meeting.type as 'milestone' | 'fixed',
    status: meeting.status,
    createdAt: meeting.createdAt,
  };
};

export const mapMeetingToClientMeetingListItemDTO = (meeting: IMeeting, contract: IContract): ClientMeetingListItemDTO => {
  const rawObj = meeting as unknown as Record<string, unknown>;
  const rawId = docIdToString(rawObj._id) || docIdToString(rawObj.id) || '';

  const freelancerData = contract.freelancerId && isPopulatedUser(contract.freelancerId)
    ? {
        freelancerId: contract.freelancerId._id?.toString() || '',
        firstName: contract.freelancerId.firstName,
        lastName: contract.freelancerId.lastName,
        profilePicture: contract.freelancerId.freelancerProfile?.logo,
      }
    : undefined;

  return {
    meetingId: rawId,
    contractId: meeting.contractId?.toString() || '',
    contractTitle: contract.title,
    scheduledAt: meeting.scheduledAt,
    durationMinutes: meeting.durationMinutes,
    agenda: meeting.agenda,
    type: meeting.type,
    meetingType: meeting.meetingType,
    status: meeting.status,
    freelancer: freelancerData,
    agora: meeting.agora ? {
      channelName: meeting.agora.channelName as string,
      createdAt: meeting.agora.createdAt
    } : undefined,
    attendance: {
      clientJoined: meeting.attendance.clientJoined,
      clientLeftAt: meeting.attendance.clientLeftAt || undefined,
      freelancerJoined: meeting.attendance.freelancerJoined,
      freelancerLeftAt: meeting.attendance.freelancerLeftAt || undefined,
    },
    notes: meeting.notes,
    rescheduleRequestedBy: meeting.rescheduleRequestedBy || undefined,
    rescheduleProposedTime: meeting.rescheduleProposedTime || undefined,
    isProposedByClient: meeting.requestedBy === 'client',
    createdAt: meeting.createdAt,
  };
};

export const mapPreContractMeetingToClientListItemDTO = (meeting: IMeeting, freelancerUser: IUser | null): ClientMeetingListItemDTO => {
  const rawObj = meeting as unknown as Record<string, unknown>;
  const rawId = docIdToString(rawObj._id) || docIdToString(rawObj.id) || '';

  const freelancerData = freelancerUser
    ? {
        freelancerId: freelancerUser._id?.toString() || '',
        firstName: freelancerUser.firstName,
        lastName: freelancerUser.lastName,
        profilePicture: freelancerUser.freelancerProfile?.logo,
      }
    : undefined;

  return {
    meetingId: rawId,
    contractId: undefined,
    contractTitle: undefined,
    scheduledAt: meeting.scheduledAt,
    durationMinutes: meeting.durationMinutes,
    agenda: meeting.agenda,
    type: undefined,
    meetingType: meeting.meetingType,
    status: meeting.status,
    freelancer: freelancerData,
    agora: meeting.agora ? {
      channelName: meeting.agora.channelName as string,
      createdAt: meeting.agora.createdAt
    } : undefined,
    attendance: {
      clientJoined: meeting.attendance.clientJoined,
      clientLeftAt: meeting.attendance.clientLeftAt || undefined,
      freelancerJoined: meeting.attendance.freelancerJoined,
      freelancerLeftAt: meeting.attendance.freelancerLeftAt || undefined,
    },
    notes: meeting.notes,
    rescheduleRequestedBy: meeting.rescheduleRequestedBy || undefined,
    rescheduleProposedTime: meeting.rescheduleProposedTime || undefined,
    isProposedByClient: meeting.requestedBy === 'client',
    createdAt: meeting.createdAt,
  };
};
