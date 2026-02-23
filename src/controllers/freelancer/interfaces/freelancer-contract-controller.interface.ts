import { Request, Response } from 'express';

export interface IFreelancerContractController {
  getContracts(req: Request, res: Response): Promise<void>;
  getContractDetail(req: Request, res: Response): Promise<void>;
  submitDeliverable(req: Request, res: Response): Promise<void>;
  submitMilestoneDeliverable(req: Request, res: Response): Promise<void>;
  requestMilestoneExtension(req: Request, res: Response): Promise<void>;
  requestContractExtension(req: Request, res: Response): Promise<void>;
  cancelContract(req: Request, res: Response): Promise<void>;
  approveChangeRequest(req: Request, res: Response): Promise<void>;
  getCancellationRequest(req: Request, res: Response): Promise<void>;
  acceptCancellationRequest(req: Request, res: Response): Promise<void>;
  raiseCancellationDispute(req: Request, res: Response): Promise<void>;
  createCancellationRequest(req: Request, res: Response): Promise<void>;
  endHourlyContract(req: Request, res: Response): Promise<void>;
  getContractTimeline(req: Request, res: Response): Promise<void>;
  uploadWorkspaceFile(req: Request, res: Response): Promise<void>;
  deleteWorkspaceFile(req: Request, res: Response): Promise<void>;
}
