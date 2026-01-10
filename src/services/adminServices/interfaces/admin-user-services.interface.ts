import {
  AdminUserDto,
  AdminUserStatsDto,
  GetUserDto,
  updateUserStatusDto,
  UserDetailDto,
} from '../../../dto/adminDTO/admin-users.dto.js';

export interface IAdminUserServices {
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
