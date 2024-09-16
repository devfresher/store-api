import { Id } from '@src/interfaces/core.interface';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthPayload {
  email: string;
  id: Id;
  isActive: boolean;
  role: string;
}

export interface DecodedAuthToken {
  payload: AuthPayload | null;
  expired: unknown;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}
