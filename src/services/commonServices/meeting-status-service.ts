import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IMeetingStatusService } from './interfaces/meeting-status-service.interface';
import { IMeetingRepository } from '../../repositories/interfaces/meeting-repository.interface';
import { IMeeting } from '../../models/interfaces/meeting.model.interface';

@injectable()
export class MeetingStatusService implements IMeetingStatusService {
  private _meetingRepository: IMeetingRepository;

  constructor(@inject('IMeetingRepository') meetingRepository: IMeetingRepository) {
    this._meetingRepository = meetingRepository;
  }

  async startScheduledMeetings(): Promise<number> {
    const now = new Date();
    const count = await this._meetingRepository.startScheduledMeetings(now);
    return count;
  }

  async completeOngoingMeetings(): Promise<number> {
    const now = new Date();
    const count = await this._meetingRepository.completeOngoingMeetings(now);
    return count;
  }

  async findMeetingsStartingSoon(): Promise<IMeeting[]> {
    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);
    const sixteenMinutesLater = new Date(now.getTime() + 16 * 60 * 1000);
    return await this._meetingRepository.findMeetingsStartingSoon(fifteenMinutesLater, sixteenMinutesLater);
  }

  async findMeetingsGoingLive(): Promise<IMeeting[]> {
    const now = new Date();
    return await this._meetingRepository.findAcceptedMeetingsStartingAt(now);
  }
}
