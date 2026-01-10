export interface IMeetingStatusService {
  startScheduledMeetings(): Promise<number>;
  completeOngoingMeetings(): Promise<number>;
}
