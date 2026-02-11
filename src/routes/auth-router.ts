import express from 'express';
import { AuthController } from '../controllers/auth/auth-controller';
import { container } from 'tsyringe';
import { validate } from '../middlewares/validation-middleware';

import {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
} from '../utils/validationSchemas/auth-validations';
import { OtpController } from '../controllers/auth/otp-controller';
import { GoogleAuthController } from '../controllers/auth/google-auth-controller';
import { jwtService } from '../utils/jwt';
import { authMiddleware } from '../middlewares/auth-middleware';
import { HttpStatus } from '../enums/http-status.enum';
import { IUserRepository } from '../repositories/interfaces/user-repository.interface';
import { jwtConfig } from '../config/jwt.config';


const authRouter = express.Router();

const authController = container.resolve(AuthController);
const otpController = container.resolve(OtpController);
const googleAuthController = container.resolve(GoogleAuthController);
authRouter.post('/signup', validate(signupSchema), authController.signup.bind(authController));
authRouter.post('/login', validate(loginSchema), authController.login.bind(authController));
authRouter.post('/otp', otpController.createOtp.bind(otpController));
authRouter.post(
  '/verify-otp',
  validate(verifyOtpSchema),
  otpController.verifyOtp.bind(otpController),
);
authRouter.post('/forgot-password', authController.forgotPassword.bind(authController));
authRouter.post('/reset-password', authController.resetPassword.bind(authController));
authRouter.post(
  '/verify-password',
  authMiddleware,
  authController.verifyPassword.bind(authController),
);

authRouter.patch(
  '/change-password',
  authMiddleware,
  authController.changePassword.bind(authController),
);
authRouter.post(
  '/action-verification',
  authMiddleware,
  authController.createActionVerification.bind(authController),
);

authRouter.post(
  '/change-email/request',
  authMiddleware,
  authController.changeEmailRequest.bind(authController),
);

authRouter.post(
  '/change-email/verify',
  authMiddleware,
  authController.verifyEmailChange.bind(authController),
);

authRouter.post(
  '/change-email/resend-otp',
  authMiddleware,
  authController.resendChangeEmailOtp.bind(authController),
);

//google login
authRouter.post('/google', googleAuthController.googleLogin.bind(googleAuthController));

authRouter.post('/logout', authController.logout.bind(authController));

authRouter.get('/me', authMiddleware, authController.me.bind(authController));

authRouter.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    const decoded = jwtService.verifyToken<{ userId: string }>(refreshToken);

    const userRepository = container.resolve<IUserRepository>('IUserRepository');
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      res.sendStatus(HttpStatus.FORBIDDEN);
      return;
    }

    const payload = {
      userId: user._id.toString(),
      activeRole: user.activeRole,
      roles: user.roles,
    };

    const newAccessToken = jwtService.createToken(payload, jwtConfig.accessTokenMaxAge);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: jwtConfig.accessTokenMaxAge * 1000,
    });

    res.json({ message: 'Access token refreshed' });
  } catch (err) {
    res.sendStatus(HttpStatus.FORBIDDEN);
  }
});

export default authRouter;
