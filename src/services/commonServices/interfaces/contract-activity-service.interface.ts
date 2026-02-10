
import { Types, ClientSession } from 'mongoose';
import { ContractTimelineDTO } from 'src/dto/commonDTO/contract-activity.dto';

export interface IContractActivityService {
  logActivity(
    contractId: Types.ObjectId,
    eventType: string,
    role: 'client' | 'freelancer' | 'system' | 'admin',
    userId: Types.ObjectId | undefined,
    title: string,
    description: string,
    metadata?: Record<string, any>,
    session?: ClientSession
  ): Promise<void>;

  getContractTimeline(contractId: string, userId: string, role: 'client' | 'freelancer'): Promise<ContractTimelineDTO>;
}
