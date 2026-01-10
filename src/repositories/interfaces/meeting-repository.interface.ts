import { ClientSession } from 'mongoose';
import BaseRepository from '../baseRepositories/base-repository';
import { IMeeting } from '../../models/interfaces/meeting.model.interface';
import { FreelancerMeetingQueryParamsDTO } from '../../dto/freelancerDTO/freelancer-meeting.dto';

export interface IMeetingRepository extends BaseRepository<IMeeting> {
  createMeeting(meetingData: Partial<IMeeting>, session?: ClientSession): Promise<IMeeting>;
  findConflictingMeetings(contractId: string, scheduledAt: Date, durationMinutes: number): Promise<IMeeting[]>;
  isMeetingAlreadyProposed(
    contractId: string,

    milestoneId?: string,
    deliverablesId?: string
  ): Promise<boolean>;
  findAllForFreelancer(
    freelancerContractIds: string[],
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<IMeeting[]>;
  countForFreelancer(
    freelancerContractIds: string[],
    query: FreelancerMeetingQueryParamsDTO,
  ): Promise<number>;
  findDetailByIdForFreelancer(meetingId: string, freelancerContractIds: string[]): Promise<IMeeting | null>;
  acceptMeeting(meetingId: string): Promise<IMeeting | null>;
  acceptMeetingByClient(meetingId: string, clientId: string): Promise<IMeeting | null>;
  rejectMeetingByClient(meetingId: string, clientId: string, reason: string): Promise<IMeeting | null>;
  requestReschedule(meetingId: string, proposedTime: Date): Promise<IMeeting | null>;
  rejectMeeting(meetingId: string, freelancerId: string, reason: string): Promise<IMeeting | null>;
  approveReschedule(meetingId: string, clientId: string): Promise<IMeeting | null>;
  declineReschedule(meetingId: string, clientId: string, reason: string): Promise<IMeeting | null>;
  requestRescheduleByClient(meetingId: string, proposedTime: Date): Promise<IMeeting | null>;
  approveRescheduleByFreelancer(meetingId: string, freelancerId: string): Promise<IMeeting | null>;
  declineRescheduleByFreelancer(meetingId: string, freelancerId: string, reason: string): Promise<IMeeting | null>;
  requestRescheduleByFreelancer(meetingId: string, proposedTime: Date): Promise<IMeeting | null>;
  findAllForContract(contractId: string): Promise<IMeeting[]>;
  findUpcomingMeetingsByFreelancerId(contractIds: string[]): Promise<IMeeting[]>;
  startScheduledMeetings(currentTime: Date): Promise<number>;
  completeOngoingMeetings(currentTime: Date): Promise<number>;
  findById(id: string, session?: ClientSession): Promise<IMeeting | null>;
}