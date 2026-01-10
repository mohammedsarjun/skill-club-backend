import { CreateGoogleUserDTO } from '../../dto/authDTO/google-auth.dto';
import { IUser } from '../../models/interfaces/user.model.interface';

export const mapCreateGoogleUserDtoToUserModel = (
  dto: CreateGoogleUserDTO,
): Pick<IUser, 'firstName' | 'lastName' | 'email' | 'avatar' | 'googleId'> => {
  return {
    googleId: dto.sub,
    firstName: dto.given_name,
    lastName: dto.family_name,
    email: dto.email,
    avatar: dto.picture,
  };
};
