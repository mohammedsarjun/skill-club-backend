import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientChatController } from './interfaces/client-chat-controller.interface';
import { IClientChatService } from '../../services/clientServices/interfaces/client-chat-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class ClientChatController implements IClientChatController {
  private _clientChatService: IClientChatService;

  constructor(@inject('IClientChatService') clientChatService: IClientChatService) {
    this._clientChatService = clientChatService;
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId, message, attachments } = req.body;

    const result = await this._clientChatService.sendMessage(clientId, {
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
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;
    const { limit, skip } = req.query;

    const result = await this._clientChatService.getMessages(clientId, {
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
    const clientId = req.user?.userId as string;
    const { contractId } = req.body;

    await this._clientChatService.markAsRead(clientId, { contractId });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Messages marked as read',
    });
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId as string;
    const { contractId } = req.params;

    const count = await this._clientChatService.getUnreadCount(clientId, contractId);

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Unread count fetched successfully',
      data: { count },
    });
  }
}
