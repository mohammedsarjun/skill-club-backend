import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { IClientWorklogController } from './interfaces/client-worklog-controller.interface';
import { IClientWorklogService } from '../../services/clientServices/interfaces/client-worklog-service.interface';
import { HttpStatus } from '../../enums/http-status.enum';

@injectable()
export class ClientWorklogController implements IClientWorklogController {
  constructor(@inject('IClientWorklogService') private worklogService: IClientWorklogService) {}

  async getWorklogsByContract(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const { contractId } = req.params;
    const { page, limit, status } = req.query;

    const result = await this.worklogService.getWorklogsByContract(clientId as string, contractId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as 'submitted' | 'approved' | 'rejected' | undefined,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Worklogs retrieved successfully',
      data: result,
    });
  }

  async getWorklogDetail(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const { contractId, worklogId } = req.params;

    const result = await this.worklogService.getWorklogDetail(
      clientId as string,
      contractId,
      worklogId,
    );

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Worklog detail retrieved successfully',
      data: result,
    });
  }

  async approveWorklog(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const { contractId } = req.params;
    const { worklogId, message } = req.body;

    const result = await this.worklogService.approveWorklog(clientId as string, contractId, {
      worklogId,
      message,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Worklog approved successfully',
      data: result,
    });
  }

  async rejectWorklog(req: Request, res: Response): Promise<void> {
    const clientId = req.user?.userId;
    const { contractId } = req.params;
    const { worklogId, message } = req.body;

    const result = await this.worklogService.rejectWorklog(clientId as string, contractId, {
      worklogId,
      message,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Worklog rejected successfully',
      data: result,
    });
  }
}
