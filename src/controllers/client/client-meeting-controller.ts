import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { MESSAGES } from '../../contants/contants';
import { IClientMeetingController } from './interfaces/client-meeting-controller.interface';
import { IClientMeetingService } from '../../services/clientServices/interfaces/client-meeting-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import {
  ClientMeetingProposalRequestDTO,
  ClientPreContractMeetingRequestDTO,
} from '../../dto/clientDTO/client-meeting.dto';

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

    const result = await this._clientMeetingService.proposeMeeting(
      clientId,
      contractId,
      meetingData,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: MESSAGES.MEETING.PROPOSED,
    });
  }

  async acceptMeeting(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId } = req.body;

    await this._clientMeetingService.acceptMeeting(clientId, { meetingId });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.MEETING.ACCEPTED,
    });
  }

  async rejectMeeting(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId, reason } = req.body;

    await this._clientMeetingService.rejectMeeting(clientId, { meetingId, reason });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.MEETING.REJECTED,
    });
  }

  async approveReschedule(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId } = req.body;

    await this._clientMeetingService.approveReschedule(clientId, { meetingId });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.MEETING.RESCHEDULE_APPROVED,
    });
  }

  async declineReschedule(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId, reason } = req.body;

    await this._clientMeetingService.declineReschedule(clientId, { meetingId, reason });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.MEETING.RESCHEDULE_DECLINED,
    });
  }

  async requestReschedule(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { meetingId, proposedTime } = req.body;

    await this._clientMeetingService.requestReschedule(clientId, {
      meetingId,
      proposedTime: new Date(proposedTime),
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.MEETING.RESCHEDULE_SENT,
    });
  }

  async getContractMeetings(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const meetings = await this._clientMeetingService.getContractMeetings(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      data: meetings,
      message: MESSAGES.MEETING.FETCH_SUCCESS,
    });
  }

  async getAllMeetings(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { page, limit, status, meetingType, requestedBy, rescheduleRequestedBy, isExpired } =
      req.query;

    const query = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as
        | 'proposed'
        | 'accepted'
        | 'completed'
        | 'missed'
        | 'partial_missed'
        | 'reschedule_requested'
        | 'cancelled'
        | 'rejected'
        | 'ongoing'
        | 'rescheduled_requested'
        | undefined,
      meetingType: meetingType as 'pre-contract' | 'post-contract' | undefined,
      requestedBy: requestedBy as 'client' | 'freelancer' | undefined,
      rescheduleRequestedBy: rescheduleRequestedBy as 'client' | 'freelancer' | undefined,
      isExpired: isExpired !== undefined ? isExpired === 'true' : undefined,
    };

    const result = await this._clientMeetingService.getAllMeetings(clientId, query);

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: MESSAGES.MEETING.FETCH_SUCCESS,
    });
  }

  async proposePreContractMeeting(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { freelancerId } = req.params;
    const meetingData = req.body as ClientPreContractMeetingRequestDTO;

    const result = await this._clientMeetingService.proposePreContractMeeting(
      clientId,
      freelancerId,
      meetingData,
    );

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: MESSAGES.MEETING.PRE_CONTRACT_PROPOSED,
    });
  }

  async joinMeeting(req: Request, res: Response): Promise<void> {
    const meetingId = req.params.meetingId;
    const clientId = req.user?.userId as string;

    const { channelName, token, appId, uid } = await this._clientMeetingService.joinMeeting(
      clientId,
      meetingId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: MESSAGES.MEETING.JOINED,
      data: { channelName, token, appId, uid },
    });
  }
}
