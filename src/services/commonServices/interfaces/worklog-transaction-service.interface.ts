export interface IWorklogTransactionService {
  releaseExpiredHoldTransactions(): Promise<void>;
}
