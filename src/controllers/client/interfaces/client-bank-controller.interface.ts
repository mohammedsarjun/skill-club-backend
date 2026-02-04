import { Request, Response } from 'express';

export interface IClientBankController {
  getBankDetails(req: Request, res: Response): Promise<void>;
  saveBankDetails(req: Request, res: Response): Promise<void>;
}
