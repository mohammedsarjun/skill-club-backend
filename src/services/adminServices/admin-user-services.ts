import { injectable, inject } from 'tsyringe';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { IAdminUserServices } from './interfaces/admin-user-services.interface';
import type { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import {
  AdminUserDto,
  AdminUserStatsDto,
  GetUserDto,
  updateUserStatusDto,
  UserDetailDto,
} from '../../dto/adminDTO/admin-users.dto';
import {
  mapUpdateUserStatusToUserModel,
  mapUserModelDtoToAdminUserDto,
  mapUserModelDtoToAdminUserStatsDto,
  mapUserQuery,
  mapUserToUserDetailDto,
} from '../../mapper/adminMapper/admin-users.mapper';

@injectable()
export class AdminUserServices implements IAdminUserServices {
  private _userRepository: IUserRepository;

  constructor(
    @inject('IUserRepository')
    userRepository: IUserRepository,
  ) {
    this._userRepository = userRepository;
  }

  async getUserStats(): Promise<AdminUserStatsDto> {
    const totalUsers = await this._userRepository.count();
    const totalFreelancers = await this._userRepository.count({ roles: 'freelancer' });
    const totalClients = await this._userRepository.count({ roles: 'client' });

    const dto: AdminUserStatsDto = mapUserModelDtoToAdminUserStatsDto({
      totalUsers,
      totalFreelancers,
      totalClients,
    });
    return dto;
  }

  async getUsers(filterRequestData: GetUserDto): Promise<{
    data: AdminUserDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const filterData = mapUserQuery(filterRequestData);
    const page = filterData.page ?? 1;
    const limit = filterData.limit ?? 10;
    const skip = (page - 1) * limit;
    let role: 'freelancer' | 'client' | undefined;

    if (filterData?.filters?.role) {
      role = filterData.filters.role;
    }

    const filter: { name?: string; role?: string } = {};
    if (filterData?.search) {
      filter.name = filterData.search;
    }
    if (role) {
      filter.role = role;
    }

    const result = await this._userRepository.getUsers(filter, {
      skip,
      limit,
    });

    const total = await this._userRepository.countAllUsers();

    // Map to DTO

    const data: AdminUserDto[] = result!.map(mapUserModelDtoToAdminUserDto);
    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getUserDetail(id: string): Promise<UserDetailDto> {
    // 1. Fetch user by ID
    const user = await this._userRepository.findById(id);
    if (!user) {
      throw new AppError(`User with ID ${id} does not exist`, HttpStatus.NOT_FOUND);
    }

    // 2. Map user entity to DTO
    const userDto = mapUserToUserDetailDto(user);

    // 3. Return the mapped DTO
    return userDto;
  }
  async updateUserStatus(userData: updateUserStatusDto): Promise<void> {
    const dto = mapUpdateUserStatusToUserModel(userData);
    const { id, role, status } = dto;

    // 1. Check if user exists
    const user = await this._userRepository.findById(id);
    if (!user) {
      throw new AppError("User with this ID doesn't exist", HttpStatus.NOT_FOUND);
    }

    // 2. Validate role
    if (!user.roles.includes(role)) {
      throw new AppError(`User does not have the role: ${role}`, HttpStatus.BAD_REQUEST);
    }

    // 3. Convert status string → boolean
    const isBlocked = status.toLowerCase() === 'block';

    // 4. Update status based on role
    switch (role) {
      case 'client':
        await this._userRepository.updateClientStatus(id, isBlocked);
        break;
      case 'freelancer':
        await this._userRepository.updateFreelancerStatus(id, isBlocked);
        break;
      default:
        throw new AppError('Invalid role provided', HttpStatus.BAD_REQUEST);
    }
  }
}
