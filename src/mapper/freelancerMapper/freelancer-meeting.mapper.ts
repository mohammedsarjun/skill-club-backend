import { IMeeting } from '../../models/interfaces/meeting.model.interface';
import { IContract } from '../../models/interfaces/contract.model.interface';
import { FreelancerMeetingListItemDTO, FreelancerMeetingDetailDTO, FreelancerMeetingProposalResponseDTO } from '../../dto/freelancerDTO/freelancer-meeting.dto';
import { IUser } from '../../models/interfaces/user.model.interface';
import { Types } from 'mongoose';

function docIdToString(id: unknown): string | undefined {
  if (!id) return undefined;
  if (typeof id === 'string') return id;
  if (id instanceof Types.ObjectId) return id.toString();
  if (typeof id === 'object' && id !== null && '_id' in id) {
    return docIdToString((id as any)._id);
  }
  return undefined;
}

function isPopulatedUser(clientId: Types.ObjectId | IUser): clientId is IUser {
  return clientId && typeof clientId === 'object' && 'firstName' in clientId;
}

export function mapMeetingToFreelancerListItemDTO(
  meeting: IMeeting,
  contract: IContract,
): FreelancerMeetingListItemDTO {

  const clientData = contract.clientId && isPopulatedUser(contract.clientId)
    ? {
        clientId: contract.clientId._id?.toString() || '',
        firstName: contract.clientId.firstName,
        lastName: contract.clientId.lastName,
        companyName: contract.clientId.clientProfile?.companyName,
        logo: contract.clientId.clientProfile?.logo,
      }
    : undefined;

  return {
    meetingId: meeting._id?.toString() || '',
    contractId: contract._id?.toString() || '',
    contractTitle: contract.title,

    scheduledAt: meeting.scheduledAt,
    durationMinutes: meeting.durationMinutes,
    agenda: meeting.agenda,
    status: meeting.status,
    client: clientData,
    agora: meeting.agora ? {
      channelName: meeting.agora.channelName as string,
      createdAt: meeting.agora.createdAt,
    } : undefined,
    attendance: meeting.attendance ? {
      clientJoined: meeting.attendance.clientJoined,
      clientLeftAt: meeting.attendance.clientLeftAt || undefined,
      freelancerJoined: meeting.attendance.freelancerJoined,
      freelancerLeftAt: meeting.attendance.freelancerLeftAt || undefined,
    } : undefined,
    notes: meeting.notes,
    rescheduleRequestedBy: meeting.rescheduleRequestedBy || undefined,
    rescheduleProposedTime: meeting.rescheduleProposedTime || undefined,
    isProposedByFreelancer: meeting.requestedBy === 'freelancer',
    createdAt: meeting.createdAt || new Date(),
  };
}

export function mapMeetingToFreelancerDetailDTO(
  meeting: IMeeting,
  contract: IContract,
): FreelancerMeetingDetailDTO {
  const milestone = meeting.milestoneId && contract.milestones
    ? contract.milestones.find((m) => m._id?.toString() === meeting.milestoneId?.toString())
    : undefined;

  const deliverable = meeting.deliverablesId && contract.deliverables
    ? contract.deliverables.find((d) => d._id?.toString() === meeting.deliverablesId?.toString())
    : undefined;

  const clientData = contract.clientId && isPopulatedUser(contract.clientId)
    ? {
        clientId: contract.clientId._id?.toString() || '',
        firstName: contract.clientId.firstName,
        lastName: contract.clientId.lastName,
        companyName: contract.clientId.clientProfile?.companyName,
        logo: contract.clientId.clientProfile?.logo,
      }
    : undefined;

  return {
    meetingId: meeting._id?.toString() || '',
    contractId: contract._id?.toString() || '',
    contractTitle: contract.title,
    type: meeting.type,
    scheduledAt: meeting.scheduledAt,
    durationMinutes: meeting.durationMinutes,
    agenda: meeting.agenda,
    status: meeting.status,
    client: clientData,
    milestoneId: meeting.milestoneId?.toString(),
    milestoneTitle: milestone?.title,
    milestoneAmount: milestone?.amount,
    deliverableId: meeting.deliverablesId?.toString(),
    deliverableVersion: deliverable?.version,
    rescheduleRequestedBy: meeting.rescheduleRequestedBy ?? undefined,
    rescheduleProposedTime: meeting.rescheduleProposedTime ?? undefined,
    notes: meeting.notes,
    isProposedByFreelancer: meeting.requestedBy === 'freelancer',
    meetingLink: meeting.agora ? (meeting.agora.channelName as string) : undefined,
    createdAt: meeting.createdAt || new Date(),
    updatedAt: meeting.updatedAt || new Date(),
  };
}

export const mapMeetingToFreelancerMeetingProposalResponseDTO = (meeting: IMeeting): FreelancerMeetingProposalResponseDTO => {
  const rawObj = meeting as unknown as Record<string, unknown>;
  const rawId = docIdToString(rawObj._id) || docIdToString(rawObj.id) || '';

  return {
    meetingId: rawId,
    contractId: meeting.contractId.toString(),
    scheduledAt: meeting.scheduledAt,
    durationMinutes: meeting.durationMinutes,
    agenda: meeting.agenda,
    type: meeting.type as 'milestone' | 'fixed',
    status: meeting.status,
    createdAt: meeting.createdAt,
  };
};
