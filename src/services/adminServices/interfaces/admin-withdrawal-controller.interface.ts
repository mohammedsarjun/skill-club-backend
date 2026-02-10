import { AdminWithdrawalStatsDTO, AdminWithdrawDTO } from "../../../dto/adminDTO/admin-withdrawal.dto";

export interface IAdminWithdrawalServices {
  getWithdrawStats(): Promise<AdminWithdrawalStatsDTO>;
  getWithdrawals(page: number, limit: number, role?: string, status?: string): Promise<{ items: AdminWithdrawDTO[]; total: number }>;
  getWithdrawalDetail(withdrawalId: string): Promise<AdminWithdrawDTO>;
  approveWithdrawal(withdrawalId: string): Promise<void>;
  rejectWithdrawal(withdrawalId: string, reason: string): Promise<void>;
}
