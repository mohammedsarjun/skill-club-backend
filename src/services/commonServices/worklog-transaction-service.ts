import { injectable, inject } from 'tsyringe';
import { IWorklogTransactionService } from './interfaces/worklog-transaction-service.interface';
import { IWorklogRepository } from '../../repositories/interfaces/worklog-repository.interface';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { IDisputeRepository } from '../../repositories/interfaces/dispute-repository.interface';
import { IContractRepository } from 'src/repositories/interfaces/contract-repository.interface';
import { IContractTransaction } from 'src/models/interfaces/contract-transaction.model.interface';
import { Types } from 'mongoose';

@injectable()
export class WorklogTransactionService implements IWorklogTransactionService {
  private _worklogRepository: IWorklogRepository;
  private _contractTransactionRepository: IContractTransactionRepository;
  private _disputeRepository: IDisputeRepository;
  private _contractRepository: IContractRepository;

  constructor(
    @inject('IWorklogRepository') worklogRepository: IWorklogRepository,
    @inject('IContractTransactionRepository')
    contractTransactionRepository: IContractTransactionRepository,
    @inject('IDisputeRepository') disputeRepository: IDisputeRepository,
    @inject('IContractRepository') contractRepository: IContractRepository,
  ) {
    this._worklogRepository = worklogRepository;
    this._contractTransactionRepository = contractTransactionRepository;
    this._disputeRepository = disputeRepository;
    this._contractRepository = contractRepository;
  }

  async releaseExpiredHoldTransactions(): Promise<void> {
    const expiredWorklogs = await this._worklogRepository.findWorklogsWithExpiredDisputeWindow();

    if (!expiredWorklogs || expiredWorklogs.length === 0) {
      return;
    }

    const worklogIdsToRelease: string[] = [];

    for (const worklog of expiredWorklogs) {
      const hasDispute = await this._disputeRepository.findActiveDisputeByWorklog(
        worklog._id.toString(),
      );

      if (!hasDispute) {
        const worklogTransaction =
          await this._contractTransactionRepository.releaseHoldTransactionsToContract(
            worklog._id.toString(),
          );
        const contract = await this._contractRepository.findById(worklog.contractId.toString());
        if (contract?.status === 'completed') {
          const refundTransaction: Partial<IContractTransaction> = {
            contractId: new Types.ObjectId(worklog.contractId.toString()),
            amount: worklogTransaction?.amount || 0,
            purpose: 'refund',
            description: 'Hourly Contract refund due to contract completion',
            clientId: contract.clientId,
            freelancerId: contract.freelancerId,
          };

          await this._contractTransactionRepository.createTransaction(refundTransaction);
        }
      }
    }

    if (worklogIdsToRelease.length === 0) {
      return;
    }
  }
}
