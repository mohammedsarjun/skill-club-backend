export interface IAdminAuthServices {
  login(adminData: { email: string; password: string }): void;
}
