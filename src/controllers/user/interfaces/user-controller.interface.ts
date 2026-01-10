import { Request, Response } from 'express';
export interface IUserController {
  selectRole(req: Request, res: Response): Promise<void>;
  me(req: Request, res: Response): void;
  createFreelancerProfile(req: Request, res: Response): Promise<void>;
  createClientProfile(req: Request, res: Response): Promise<void>;
  switchRole(req: Request, res: Response): Promise<void>;
  getProfile(req: Request, res: Response): Promise<void>;
  getAddress(req: Request, res: Response): Promise<void>;
  updateAddress(req: Request, res: Response): Promise<void>;
  createActionVerification(req: Request, res: Response): Promise<void>;
  updateProfile(req: Request, res: Response): Promise<void>;
}
