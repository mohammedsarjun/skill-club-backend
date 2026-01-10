export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  password: string;
  agreement: boolean;
  timezone?: string;
  country?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
  rememberMe: string;
}

export interface GetUserDto {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: number;
}
