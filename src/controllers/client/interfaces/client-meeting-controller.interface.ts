import { Request, Response } from 'express';

export interface IClientMeetingController {
  proposeMeeting(req: Request, res: Response): Promise<void>;
  proposePreContractMeeting(req: Request, res: Response): Promise<void>;
  getContractMeetings(req: Request, res: Response): Promise<void>;
  getAllMeetings(req: Request, res: Response): Promise<void>;
  acceptMeeting(req: Request, res: Response): Promise<void>;
  rejectMeeting(req: Request, res: Response): Promise<void>;
  approveReschedule(req: Request, res: Response): Promise<void>;
  declineReschedule(req: Request, res: Response): Promise<void>;
  requestReschedule(req: Request, res: Response): Promise<void>;
  joinMeeting(req: Request, res: Response): Promise<void>;
}
