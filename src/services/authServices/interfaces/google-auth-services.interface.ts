import { UserDto } from '../../../dto/user.dto';

export interface IGoogleAuthService {
  verifyToken(idToken: string): Promise<UserDto>;
}
