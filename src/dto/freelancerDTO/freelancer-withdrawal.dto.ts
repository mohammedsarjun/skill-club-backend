export interface FreelancerWithdrawalListItemDTO {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  note?: string;
}

export interface FreelancerWithdrawalDetailDTO {
  id: string;
  transactionId: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  purpose: string;
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    accountType: string;
    verified: boolean;
  };
}
