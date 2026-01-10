// services/GoogleAuthService.ts
import { OAuth2Client } from 'google-auth-library';
import { IGoogleAuthService } from './interfaces/google-auth-services.interface';
import { inject, injectable } from 'tsyringe';
import type { IUserRepository } from '../../repositories/interfaces/user-repository.interface';
import { mapCreateGoogleUserDtoToUserModel } from '../../mapper/authMapper/google-auth.mapper';
import { mapUserModelToUserDto } from '../../mapper/user.mapper';
import { UserDto } from '../../dto/user.dto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

@injectable()
class GoogleAuthService implements IGoogleAuthService {
  private _userRepository: IUserRepository;
  constructor(@inject('IUserRepository') userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  async verifyToken(idToken: string): Promise<UserDto> {
    // Verify token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID!, // must match your Google client ID
    });

    // Extract payload
    const payload = ticket.getPayload();

    // Example: get user info

    const { sub, email, given_name, picture, family_name } = payload!;

    let user = await this._userRepository.findOne({ email });

    if (user) {
      // ✅ Login flow
      // issue JWT/session for existing user
      // res.json({ status: "login", user });
    } else {
      // ✅ Signup flow
      const googleUserDto = mapCreateGoogleUserDtoToUserModel({
        sub,
        email: payload?.email!,
        given_name: given_name ? given_name : '',
        family_name: family_name ? family_name : '',
        picture: picture ? picture : '',
      });
      user = await this._userRepository.create(googleUserDto);
    }

    if (!user) {
      throw new Error('Failed to create or fetch Google user');
    }

    return mapUserModelToUserDto(user);
  }
}

export default GoogleAuthService;
