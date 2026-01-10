import { Request, Response } from 'express';

export interface IClientController {
  getClientData(req: Request, res: Response): Promise<void>;
  updateClient(req: Request, res: Response): Promise<void>;
}
