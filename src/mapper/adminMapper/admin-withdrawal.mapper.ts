import { IContractTransaction } from '../../models/interfaces/contract-transaction.model.interface';
import { IUser, IFreelancerProfile } from '../../models/interfaces/user.model.interface';
import { IBankDetails } from '../../models/interfaces/bank-details.model.interface';
import { AdminWithdrawDTO } from '../../dto/adminDTO/admin-withdrawal.dto';

function maskAccountNumber(accountNumber?: string): string {
  if (!accountNumber) return '';
  return accountNumber.replace(/\d(?=\d{4})/g, '*');
}

export function mapContractTransactionToAdminWithdrawDTO(
  transaction: IContractTransaction,
  freelancer?: IUser | null,
  bankDetails?: IBankDetails | null,
): AdminWithdrawDTO {
  const freelancerObj = freelancer as unknown as IUser | undefined;

  const name = freelancerObj
    ? `${freelancerObj.firstName || ''} ${freelancerObj.lastName || ''}`.trim() || ''
    : '';

  const profile = (freelancerObj && (freelancerObj.freelancerProfile as IFreelancerProfile | undefined)) || undefined;

  const workCategory = profile?.workCategory
    ? // if populated object with name
      (profile.workCategory as any).name || profile.workCategory.toString()
    : '';

  return {
    transaction: {
      transactionId: transaction.transactionId,
      purpose: transaction.purpose,
      status: transaction.status,
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.createdAt ? transaction.createdAt.toISOString() : new Date().toISOString(),
    },
    freelancer: {
      id: (() => {
        const txFid = (transaction.freelancerId as any) || null;
        if (freelancerObj?._id) return freelancerObj._id.toString();
        if (!txFid) return '';
        if (typeof txFid === 'string') return txFid;
        if (txFid._id) return txFid._id.toString();
        if (typeof txFid.toString === 'function') {
          const s = txFid.toString();
          return /^[a-fA-F0-9]{24}$/.test(s) ? s : '';
        }
        return '';
      })(),
      name,
      email: freelancerObj?.email || '',
      avatar: freelancerObj?.avatar || '',
      phone: freelancerObj?.phone ? String(freelancerObj.phone) : '',
      isVerified: Boolean(freelancerObj?.isVerified),
      isBlocked: Boolean(freelancerObj?.isFreelancerBlocked),
      profile: {
        professionalRole: profile?.professionalRole || '',
        hourlyRate: profile?.hourlyRate || 0,
        workCategory: workCategory || '',
      },
    },
    bankDetails: {
      accountHolderName: bankDetails?.accountHolderName || '',
      bankName: bankDetails?.bankName || '',
      accountNumberMasked: maskAccountNumber(bankDetails?.accountNumber),
      ifscCode: bankDetails?.ifscCode || '',
      accountType: (bankDetails?.accountType as 'savings' | 'current') || 'savings',
      verified: Boolean(bankDetails?.verified),
    },
  } as AdminWithdrawDTO;
}
