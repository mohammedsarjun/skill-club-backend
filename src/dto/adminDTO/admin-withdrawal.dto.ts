
export interface AdminWithdrawalStatsDTO {
pendingRequests:number
totalPendingAmount:number
totalWithdrawn:number
}

export interface AdminWithdrawDTO {
  transaction: {
    transactionId: string;
    purpose: 'withdrawal';
    status: 'withdrawal_requested';
    amount: number;
    description: string;
    createdAt: string; // ISO date string
  };

  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    phone: string;
    isVerified: boolean;
    isBlocked: boolean;
    role: string;

    profile: {
      professionalRole: string;
      hourlyRate: number;
      workCategory: string;
    };
  };

  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    accountType: 'savings' | 'current';
    verified: boolean;
  };
}
