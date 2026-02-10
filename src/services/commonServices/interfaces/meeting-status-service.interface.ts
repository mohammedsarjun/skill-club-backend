import { IMeeting } from '../../../models/interfaces/meeting.model.interface';

export interface IMeetingStatusService {
  startScheduledMeetings(): Promise<number>;
  completeOngoingMeetings(): Promise<number>;
  findMeetingsStartingSoon(): Promise<IMeeting[]>;
  findMeetingsGoingLive(): Promise<IMeeting[]>;
}
