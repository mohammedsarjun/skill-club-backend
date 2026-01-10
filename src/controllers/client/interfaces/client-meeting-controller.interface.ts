import { Request, Response } from 'express';

export interface IClientMeetingController {
  proposeMeeting(req: Request, res: Response): Promise<void>;
  getContractMeetings(req: Request, res: Response): Promise<void>;
  requestReschedule(req: Request, res: Response): Promise<void>;
  
}
