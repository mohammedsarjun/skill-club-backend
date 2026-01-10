import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IFreelancerChatController } from './interfaces/freelancer-chat-controller.interface';
import { IFreelancerChatService } from '../../services/freelancerServices/interfaces/freelancer-chat-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class FreelancerChatController implements IFreelancerChatController {
  private _freelancerChatService: IFreelancerChatService;

  constructor(@inject('IFreelancerChatService') freelancerChatService: IFreelancerChatService) {
    this._freelancerChatService = freelancerChatService;
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId, message, attachments } = req.body;

    const result = await this._freelancerChatService.sendMessage(freelancerId, {
      contractId,
      message,
      attachments,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: 'Message sent successfully',
      data: result,
    });
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;
    const { limit, skip } = req.query;

    const result = await this._freelancerChatService.getMessages(freelancerId, {
      contractId,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Messages fetched successfully',
      data: result,
    });
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.body;

    await this._freelancerChatService.markAsRead(freelancerId, { contractId });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Messages marked as read',
    });
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    const freelancerId = req.user?.userId as string;
    const { contractId } = req.params;

    const count = await this._freelancerChatService.getUnreadCount(freelancerId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Unread count fetched successfully',
      data: { count },
    });
  }
}
