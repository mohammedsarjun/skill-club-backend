

export interface IAdminWithdrawalServices {
  getUserStats(): Promise<AdminUserStatsDto>;
  getUsers(dto: GetUserDto): Promise<{
    data: AdminUserDto[];
    total: number;
    page: number;
    limit: number;
  }>;
  getUserDetail(id: string): Promise<UserDetailDto>;
  updateUserStatus(userData: updateUserStatusDto): Promise<void>;
}
