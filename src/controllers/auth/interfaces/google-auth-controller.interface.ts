import { Request, Response } from 'express';
export interface IGoogleAuthController {
  googleLogin(req: Request, res: Response): Promise<void>;
}
