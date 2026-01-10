import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IMeetingStatusService } from './interfaces/meeting-status-service.interface';
import { IMeetingRepository } from '../../repositories/interfaces/meeting-repository.interface';

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
}
