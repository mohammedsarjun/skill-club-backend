
export interface AdminWithdrawalStatsDTO {
  pendingRequests: number;
  totalPendingAmount: number;
  totalWithdrawn: number;
}

export interface AdminWithdrawDTO {
  id: string;
  role: string;
  transaction: {
    transactionId: string;
    purpose: string;
    status: string;
    amount: number;
    description: string;
    createdAt: string;
  };

  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    phone: string;
    isVerified: boolean;
    isBlocked: boolean;

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
    accountType: string;
    verified: boolean;
  };
}
