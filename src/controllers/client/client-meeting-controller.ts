import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';    
import { IClientMeetingController } from './interfaces/client-meeting-controller.interface';
import { IClientMeetingService } from '../../services/clientServices/interfaces/client-meeting-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import { ClientMeetingProposalRequestDTO } from '../../dto/clientDTO/client-meeting.dto';

@injectable()
export class ClientMeetingController implements IClientMeetingController {
  private _clientMeetingService: IClientMeetingService;
  constructor(@inject('IClientMeetingService') clientMeetingService: IClientMeetingService) {
    this._clientMeetingService = clientMeetingService;
  }

  async proposeMeeting(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const meetingData = req.body as ClientMeetingProposalRequestDTO;



    const result = await this._clientMeetingService.proposeMeeting(clientId, contractId, meetingData);
    
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Meeting proposed successfully',
    });
  }

  async acceptMeeting(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId } = req.body;

    await this._clientMeetingService.acceptMeeting(clientId, { meetingId });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Meeting accepted successfully',
    });
  }

  async rejectMeeting(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId, reason } = req.body;

    await this._clientMeetingService.rejectMeeting(clientId, { meetingId, reason });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Meeting rejected successfully',
    });
  }

  async approveReschedule(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId } = req.body;

    await this._clientMeetingService.approveReschedule(clientId, { meetingId });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Reschedule approved successfully',
    });
  }

  async declineReschedule(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId, reason } = req.body;

    await this._clientMeetingService.declineReschedule(clientId, { meetingId, reason });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Reschedule declined successfully',
    });
  }

  async requestReschedule(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId, proposedTime } = req.body;

    await this._clientMeetingService.requestReschedule(clientId, { meetingId, proposedTime: new Date(proposedTime) });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Reschedule request sent successfully',
    });
  }

  async getContractMeetings(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const meetings = await this._clientMeetingService.getContractMeetings(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: meetings,
      message: 'Meetings retrieved successfully',
    });
  }
  async joinMeeting(req: Request, res: Response): Promise<void> {
    const meetingId = req.params.meetingId;
    const clientId = req.user?.userId as string;

    const { channelName, token, appId, uid } = await this._clientMeetingService.joinMeeting(clientId, meetingId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Joined meeting successfully',
      data: { channelName, token, appId, uid },
    });
  }
}
