import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserModel, { User } from '@src/db/models/user.model';
import {
  ResetPasswordDto,
  LoginDto,
  DecodedAuthToken,
  AuthPayload,
} from '@src/interfaces/auth.interface';
import userService from '@src/services/user.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  SystemException,
  UnauthorizedException,
} from '@src/exceptions';
import serverConfig from '@src/config/server.config';
import BaseService from '.';
import { Id } from '@src/interfaces/core.interface';
import helperUtil from '@src/utils/helper.util';

class AuthService extends BaseService<User> {
  constructor() {
    super('User', UserModel);
  }

  public async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.model.findOne({ email }).select('+password');

    if (user && this.validatePassword(user, password)) {
      if (!user.isActive)
        throw new UnauthorizedException(
          'Your account is currently not active, contact support for assistance.'
        );

      const { password, ...result } = user.toJSON();
      return result as User;
    }

    return null;
  }

  public async login(data: LoginDto): Promise<{ user: User; access_token: string }> {
    const user = await this.validateUser(data.email, data.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.generateAccessToken(user);
    await this.updateLastLogin(user._id);

    return { user, access_token };
  }

  public validatePassword(user: User, password: string): boolean {
    try {
      return bcrypt.compareSync(password, user.password);
    } catch (error) {
      return false;
    }
  }

  public async forgotPassword(email: string): Promise<User> {
    const user = await this.get({ filter: { email }, optimized: true });

    if (!user) {
      throw new NotFoundException(`User with email '${email}' does not exist.`);
    }

    const token = helperUtil.generateOtp();

    // TODO: implement email queue
    // await mailQueue.addJob({
    //   to: user.email,
    //   templateName: MailTemplates.forgotPassword,
    //   replacements: {
    //     user,
    //     token,
    //   },
    // });

    return user;
  }

  public async resetPassword(data: ResetPasswordDto): Promise<User> {
    const user = await userService.getOrError({
      filter: { email: data.email },
      optimized: true,
    });

    const isValid = helperUtil.verifyOtp(data.otp, 5);

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const { confirmPassword } = data;

    if (this.validatePassword(user, confirmPassword)) {
      throw new ConflictException('Current password cannot be used as new password.');
    }

    await user.set('password', confirmPassword).save();

    // TODO: implement email queue
    // await mailQueue.addJob({
    //   to: user.email,
    //   templateName: MailTemplates.passwordResetCompleted,
    //   replacements: {
    //     user,
    //   },
    // });

    return user;
  }

  private generateAccessToken(user: User): string {
    const payload = {
      email: user.email,
      isActive: user.isActive,
      id: user._id,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, serverConfig.AUTH_SECRET, {
      expiresIn: serverConfig.JWT_ACCESS_EXPIRES_IN,
    });

    return accessToken;
  }

  public verifyAccessToken(token: string): DecodedAuthToken {
    try {
      const payload = jwt.verify(token, serverConfig.AUTH_SECRET) as AuthPayload;
      return {
        payload,
        expired: false,
      };
    } catch (error) {
      return {
        payload: null,
        expired: (error as SystemException).message.includes('expired')
          ? (error as SystemException).message
          : error,
      };
    }
  }

  private async updateLastLogin(userId: Id): Promise<void> {
    await this.model.updateOne({ _id: userId }, { lastLogin: new Date() });
  }
}

export default new AuthService();
