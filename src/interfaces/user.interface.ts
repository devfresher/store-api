import { UserRole } from './enum.interface';

export interface ChangePasswordDto {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  password: string;
  role?: UserRole;
}
