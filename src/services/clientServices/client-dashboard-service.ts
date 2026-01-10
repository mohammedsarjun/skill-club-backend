import { injectable, inject } from 'tsyringe';
import '../../config/container';
import { IClientDashboardService } from './interfaces/client-dashboard-service.interface';
import { ClientDashboardDTO } from '../../dto/clientDTO/client-dashboard.dto';
import { IJobRepository } from '../../repositories/interfaces/job-repository.interface';
import { IProposalRepository } from '../../repositories/interfaces/proposal-repository.interface';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IChatRepository } from '../../repositories/chat-repository.interface';
import { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import {
  mapJobToRecentJobDTO,
  mapMessageToRecentMessageDTO,
  mapToDashboardStatsDTO,
} from '../../mapper/clientMapper/client-dashboard.mapper';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { ERROR_MESSAGES } from '../../contants/error-constants';

@injectable()
export class ClientDashboardService implements IClientDashboardService {
  private _jobRepository: IJobRepository;
  private _proposalRepository: IProposalRepository;
  private _contractRepository: IContractRepository;
  private _chatRepository: IChatRepository;
  private _userRepository: IUserRepository;
  constructor(
    @inject('IJobRepository') jobRepository: IJobRepository,
    @inject('IProposalRepository') proposalRepository: IProposalRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
    @inject('IChatRepository') chatRepository: IChatRepository,
    @inject('IUserRepository') userRepository: IUserRepository,
  ) {
    this._jobRepository = jobRepository;
    this._proposalRepository = proposalRepository;
    this._contractRepository = contractRepository;
    this._chatRepository = chatRepository;
    this._userRepository = userRepository;
  }

  async getDashboardData(clientId: string): Promise<ClientDashboardDTO> {
    const client = await this._userRepository.findById(clientId);
    if (!client) {
      throw new AppError(ERROR_MESSAGES.CLIENT.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const activeJobsCount = await this._jobRepository.countActiveJobsByClientId(clientId);
    const postedJobsCount = await this._jobRepository.countAllJobsByClientId(clientId);
    const totalSpend = await this._contractRepository.getTotalSpendByClientId(clientId);
    const pendingProposalsCount =
      await this._proposalRepository.countPendingProposalsByClientId(clientId);

    const stats = mapToDashboardStatsDTO(
      activeJobsCount,
      postedJobsCount,
      totalSpend,
      pendingProposalsCount,
    );

    const recentJobsData = await this._jobRepository.getRecentJobsByClientId(clientId, 4);
    const recentJobs = await Promise.all(
      recentJobsData.map(async (job) => {
        const jobId = String(job._id || '');
        const proposalsCount = await this._proposalRepository.countProposalsByJobId(jobId);
        return mapJobToRecentJobDTO(job, proposalsCount);
      }),
    );

    const contractIds = await this._contractRepository.getContractIdsByClientId(clientId);
    const recentMessagesData = await this._chatRepository.getRecentMessagesByContracts(
      contractIds,
      4,
    );

    const recentMessages = await Promise.all(
      recentMessagesData.map(async (message) => {
        const sender = await this._userRepository.findById(message.senderId);
        const senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown';
        const isUnread = !message.isRead && message.senderRole === 'freelancer';
        return mapMessageToRecentMessageDTO(message, senderName, isUnread);
      }),
    );

    return {
      stats,
      recentJobs,
      recentMessages,
    };
  }
}
