import { ClientSession } from 'mongoose';
import BaseRepository from '../baseRepositories/base-repository';
import { IMeeting } from '../../models/interfaces/meeting.model.interface';
import { FreelancerMeetingQueryParamsDTO } from '../../dto/freelancerDTO/freelancer-meeting.dto';
import { ClientMeetingQueryParamsDTO } from '../../dto/clientDTO/client-meeting.dto';

export interface IMeetingRepository extends BaseRepository<IMeeting> {
  createMeeting(meetingData: Partial<IMeeting>, session?: ClientSession): Promise<IMeeting>;
  createPreContractMeeting(
    clientId: string,
    freelancerId: string,
    meetingData: Record<string, unknown>,
  ): Promise<IMeeting>;
  findConflictingMeetings(
    contractId: string,
    scheduledAt: Date,
    durationMinutes: number,
  ): Promise<IMeeting[]>;
  hasActivePreContractMeeting(clientId: string, freelancerId: string): Promise<boolean>;
  isMeetingAlreadyProposed(
    contractId: string,
    milestoneId?: string,
    deliverablesId?: string,
  ): Promise<boolean>;
  findAllForFreelancer(
    freelancerContractIds: string[],
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<IMeeting[]>;
  countForFreelancer(
    freelancerContractIds: string[],
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<number>;
  findAllForClient(
    clientContractIds: string[],
    query: ClientMeetingQueryParamsDTO,
  ): Promise<IMeeting[]>;
  countForClient(clientContractIds: string[], query: ClientMeetingQueryParamsDTO): Promise<number>;
  findDetailByIdForFreelancer(
    meetingId: string,
    freelancerContractIds: string[],
  ): Promise<IMeeting | null>;
  acceptMeeting(meetingId: string): Promise<IMeeting | null>;
  acceptMeetingByClient(meetingId: string, clientId: string): Promise<IMeeting | null>;
  rejectMeetingByClient(
    meetingId: string,
    clientId: string,
    reason: string,
  ): Promise<IMeeting | null>;
  requestReschedule(meetingId: string, proposedTime: Date): Promise<IMeeting | null>;
  rejectMeeting(meetingId: string, freelancerId: string, reason: string): Promise<IMeeting | null>;
  approveReschedule(meetingId: string, clientId: string): Promise<IMeeting | null>;
  declineReschedule(meetingId: string, clientId: string, reason: string): Promise<IMeeting | null>;
  requestRescheduleByClient(meetingId: string, proposedTime: Date): Promise<IMeeting | null>;
  approveRescheduleByFreelancer(meetingId: string, freelancerId: string): Promise<IMeeting | null>;
  declineRescheduleByFreelancer(
    meetingId: string,
    freelancerId: string,
    reason: string,
  ): Promise<IMeeting | null>;
  requestRescheduleByFreelancer(meetingId: string, proposedTime: Date): Promise<IMeeting | null>;
  findAllForContract(contractId: string): Promise<IMeeting[]>;
  findUpcomingMeetingsByFreelancerId(contractIds: string[]): Promise<IMeeting[]>;
  findPreContractMeetingsForClient(
    clientId: string,
    query: ClientMeetingQueryParamsDTO,
  ): Promise<IMeeting[]>;
  countPreContractMeetingsForClient(
    clientId: string,
    query: ClientMeetingQueryParamsDTO,
  ): Promise<number>;
  findPreContractMeetingsForFreelancer(
    freelancerId: string,
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<IMeeting[]>;
  countPreContractMeetingsForFreelancer(
    freelancerId: string,
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<number>;
  startScheduledMeetings(currentTime: Date): Promise<number>;
  completeOngoingMeetings(currentTime: Date): Promise<number>;
  findMeetingsStartingSoon(startTime: Date, endTime: Date): Promise<IMeeting[]>;
  findAcceptedMeetingsStartingAt(currentTime: Date): Promise<IMeeting[]>;
  findById(id: string, session?: ClientSession): Promise<IMeeting | null>;
}
