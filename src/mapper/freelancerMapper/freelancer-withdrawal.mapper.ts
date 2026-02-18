import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';
import { IBankDetails } from '../../models/interfaces/bank-details.model.interface';
import {
  FreelancerWithdrawalListItemDTO,
  FreelancerWithdrawalDetailDTO,
} from '../../dto/freelancerDTO/freelancer-withdrawal.dto';

function maskAccountNumber(accountNumber?: string): string {
  if (!accountNumber) return '';
  return accountNumber.replace(/\d(?=\d{4})/g, '*');
}

export function mapContractTransactionToFreelancerWithdrawalListItemDTO(
  transaction: IContractTransaction,
): FreelancerWithdrawalListItemDTO {
  const rawId = (transaction as unknown as { _id?: { toString(): string } })._id?.toString() ?? '';

  return {
    id: rawId,
    transactionId: transaction.transactionId,
    amount: transaction.amount,
    status: transaction.status,
    description: transaction.description,
    createdAt: transaction.createdAt
      ? transaction.createdAt.toISOString()
      : new Date().toISOString(),
    note: transaction.metadata?.note as string | undefined,
  };
}

export function mapContractTransactionToFreelancerWithdrawalDetailDTO(
  transaction: IContractTransaction,
  bankDetails?: IBankDetails | null,
): FreelancerWithdrawalDetailDTO {
  const rawId = (transaction as unknown as { _id?: { toString(): string } })._id?.toString() ?? '';

  return {
    id: rawId,
    transactionId: transaction.transactionId,
    amount: transaction.amount,
    status: transaction.status,
    description: transaction.description,
    createdAt: transaction.createdAt
      ? transaction.createdAt.toISOString()
      : new Date().toISOString(),
    updatedAt: transaction.updatedAt
      ? transaction.updatedAt.toISOString()
      : new Date().toISOString(),
    role: transaction.role || 'freelancer',
    purpose: transaction.purpose,
    bankDetails: {
      accountHolderName: bankDetails?.accountHolderName || '',
      bankName: bankDetails?.bankName || '',
      accountNumberMasked: maskAccountNumber(bankDetails?.accountNumber),
      ifscCode: bankDetails?.ifscCode || '',
      accountType: bankDetails?.accountType || 'savings',
      verified: Boolean(bankDetails?.verified),
    },
  };
}
