import { Request, Response } from 'express';

export interface IGetRatesController {
  getRatesController(req: Request, res: Response): Promise<void>;
}
