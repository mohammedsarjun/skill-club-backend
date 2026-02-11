import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerMeetingController } from './interfaces/freelancer-meeting-controller.interface';
import { IFreelancerMeetingService } from '../../services/freelancerServices/interfaces/freelancer-meeting-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';
import {
  FreelancerMeetingQueryParamsDTO,
  AcceptMeetingDTO,
  RequestRescheduleDTO,
  FreelancerMeetingProposalRequestDTO,
} from '../../dto/freelancerDTO/freelancer-meeting.dto';

@injectable()
export class FreelancerMeetingController implements IFreelancerMeetingController {
  private _freelancerMeetingService: IFreelancerMeetingService;

  constructor(
    @inject('IFreelancerMeetingService') freelancerMeetingService: IFreelancerMeetingService,
  ) {
    this._freelancerMeetingService = freelancerMeetingService;
  }

  async getMeetings(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { page, limit, status,isExpired } = req.query;

    const query: FreelancerMeetingQueryParamsDTO = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as FreelancerMeetingQueryParamsDTO['status'],
      isExpired: isExpired !== undefined ? isExpired === 'true' : undefined,
    };

    const result = await this._freelancerMeetingService.getAllMeetings(freelancerId, query);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Meetings fetched successfully',
      data: result,
    });
  }

  async getMeetingDetail(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { meetingId } = req.params;

    const result = await this._freelancerMeetingService.getMeetingDetail(freelancerId, meetingId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Meeting detail fetched successfully',
      data: result,
    });
  }

  async getContractMeetings(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const meetings = await this._freelancerMeetingService.getContractMeetings(freelancerId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Meetings retrieved successfully',
      data: meetings,
    });
  }

  async acceptMeeting(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { meetingId } = req.body;

    const data: AcceptMeetingDTO = { meetingId };

    await this._freelancerMeetingService.acceptMeeting(freelancerId, data);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Meeting accepted successfully',
    });
  }

  async requestReschedule(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { meetingId, proposedTime } = req.body;

    const data: RequestRescheduleDTO = {
      meetingId,
      proposedTime: new Date(proposedTime),
    };

    await this._freelancerMeetingService.requestReschedule(freelancerId, data);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Reschedule request sent successfully',
    });
  }

  async rejectMeeting(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { meetingId, reason } = req.body;

    await this._freelancerMeetingService.rejectMeeting(freelancerId, { meetingId, reason });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Meeting rejected successfully',
    });
  }

  async proposeMeeting(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const { scheduledAt, durationMinutes, agenda, type } = req.body;

    const data: FreelancerMeetingProposalRequestDTO = {
      scheduledAt: new Date(scheduledAt),
      durationMinutes,
      agenda,
      type,
    };

    const result = await this._freelancerMeetingService.proposeMeeting(freelancerId, contractId, data);

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Meeting proposed successfully',
      data: result,
    });
  }

  async approveReschedule(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { meetingId } = req.body;

    await this._freelancerMeetingService.approveReschedule(freelancerId, { meetingId });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Reschedule approved successfully',
    });
  }

  async declineReschedule(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { meetingId, reason } = req.body;

    await this._freelancerMeetingService.declineReschedule(freelancerId, { meetingId, reason });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Reschedule declined successfully',
    });
  }

  async counterReschedule(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { meetingId, proposedTime } = req.body;

    await this._freelancerMeetingService.counterReschedule(freelancerId, { meetingId, proposedTime });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Counter reschedule request sent successfully',
    });
  }

  async joinMeeting(req: Request, res: Response): Promise<void> {
    const meetingId = req.params.meetingId;
    const freelancerId = req.user?.userId as string;

    const { channelName, token, appId, uid } = await this._freelancerMeetingService.joinMeeting(freelancerId, meetingId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Joined meeting successfully',
      data: { channelName, token, appId, uid },
    });
  }
}
