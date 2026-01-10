export interface GetOtpDto {
  email: string;
  expiresAt: Date;
  purpose: 'signup' | 'forgotPassword' | 'changeEmail';
}
