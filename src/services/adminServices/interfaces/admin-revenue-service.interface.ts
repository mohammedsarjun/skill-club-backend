import { AdminRevenueResponseDto, GetRevenueQueryDto } from '../../../dto/adminDTO/admin-revenue.dto';

export interface IAdminRevenueService {
  getRevenueData(query: GetRevenueQueryDto): Promise<AdminRevenueResponseDto>;
}
