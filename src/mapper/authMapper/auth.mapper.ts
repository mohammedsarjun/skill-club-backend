import { CreateUserDTO, GetUserDto } from '../../dto/authDTO/auth.dto';
import { IUser } from '../../models/interfaces/user.model.interface';

export const mapCreateUserDtoToUserModel = (
  dto: CreateUserDTO,
): Pick<
  IUser,
  'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'preferredTimezone' | 'address'
> & {
  agreement: boolean;
} => {
  console.log('Mapping CreateUserDTO to UserModel:');
  console.log(dto);
  return {
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    password: dto.password,
    agreement: dto.agreement,
    preferredTimezone: dto.timezone || 'UTC',
    address: {
      country: dto.country || '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: 0,
    },
  };
};

export const mapUserModelToGetUserDto = (modelData: IUser): GetUserDto => {
  return {
    id: modelData._id.toString(),
    firstName: modelData.firstName,
    lastName: modelData.lastName,
    email: modelData.email,
    phone: modelData.phone!,
  };
};
