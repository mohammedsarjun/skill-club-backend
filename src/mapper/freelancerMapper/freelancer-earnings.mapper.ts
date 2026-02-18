import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';
import { FreelancerTransactionItemDTO } from '../../dto/freelancerDTO/freelancer-earnings.dto';

export const mapContractTransactionToFreelancerTransactionItemDTO = (
  transaction: IContractTransaction,
): FreelancerTransactionItemDTO => {
  const rawId = (transaction as unknown as { _id?: { toString(): string } })._id?.toString() ?? '';

  const clientPop = transaction.clientId as unknown as Partial<{
    firstName?: string;
    lastName?: string;
    toString?: () => string;
  }>;

  const clientName =
    typeof transaction.clientId === 'object' && transaction.clientId !== null
      ? `${clientPop.firstName || ''} ${clientPop.lastName || ''}`.trim() || undefined
      : undefined;

  return {
    id: rawId,
    transactionId: transaction.transactionId,
    contractId: (transaction.contractId as { toString(): string }).toString(),
    amount: transaction.amount,
    purpose: transaction.purpose,
    description: transaction.description,
    createdAt: transaction.createdAt!,
    clientName,
  };
};
