import { Request, Response } from 'express';

export interface IFreelancerMeetingController {
  getMeetings(req: Request, res: Response): Promise<void>;
  getMeetingDetail(req: Request, res: Response): Promise<void>;
  acceptMeeting(req: Request, res: Response): Promise<void>;
  requestReschedule(req: Request, res: Response): Promise<void>;
  proposeMeeting(req: Request, res: Response): Promise<void>;
  joinMeeting(req: Request, res: Response): Promise<void>;
}
