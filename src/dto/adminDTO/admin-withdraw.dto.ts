export interface AdminWithdrawQueryDTO {
  search?: string;
  page?: number;
  limit?: number;
  filters?: { role?: 'client' | 'freelancer'; status?: string };
}

export interface AdminWithdrawListItemDTO {
  id: string;
  transactionId?: string;
  userId?: string;
  userName?: string;
  role: 'client' | 'freelancer';
  amount: number;
  status: string;
  createdAt: Date;
}

export interface AdminWithdrawListResultDTO {
  items: AdminWithdrawListItemDTO[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminWithdrawDetailDTO {
  id: string;
  transactionId?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  role: 'client' | 'freelancer';
  amount: number;
  status: string;
  requestedAt: Date;
  processedAt?: Date;
  note?: string;
  bankDetails?: {
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
  };
}
