import { ClientSession } from 'mongoose';

import UserModel, { User } from '@src/db/models/user.model';
import {
  FindAllOption,
  Id,
  PageOptions,
  PaginatedResult,
  QueryOptions,
  SortOrder,
} from '@src/interfaces/core.interface';
import BaseService from '@src/services';
import authService from '@src/services/auth.service';
import { ConflictException } from '@src/exceptions';
import { ChangePasswordDto, CreateUserDto, UpdateProfileDto } from '@src/interfaces/user.interface';

class UserService extends BaseService<User> {
  constructor() {
    super('User', UserModel);
  }

  defaultRelations = [];

  async getAll(
    pageOpts?: PageOptions,
    queryOpts?: QueryOptions
  ): Promise<User[] | PaginatedResult<User>> {
    const options: FindAllOption<User> = {
      pageOpts,
      relations: this.defaultRelations,
      sortBy: queryOpts?.sortBy as keyof User,
      sortOrder: queryOpts?.sortOrder,
      filter: {
        ...(queryOpts?.role && { role: queryOpts.role }),
        ...(queryOpts?.isActive !== undefined && {
          isActive: queryOpts.isActive,
        }),
      },
    };

    if (queryOpts?.search) {
      options.filter = {
        $or: [
          { name: { $regex: queryOpts.search, $options: 'i' } },
          { email: { $regex: queryOpts.search, $options: 'i' } },
        ],
      };
    }

    const users = await this.getAllForService(options);
    return users;
  }

  async getById(id: Id, session?: ClientSession): Promise<User> {
    const user = await this.getOrError(
      { filter: { _id: id }, relations: this.defaultRelations },
      session
    );
    return user;
  }

  async create(data: CreateUserDto): Promise<User> {
    const user = await this.get({ filter: { email: data.email }, optimized: true });
    if (user) {
      throw new ConflictException('User already exists.');
    }

    const newUser = await this.model.create(data);
    return newUser;
  }

  async changePassword(userId: Id, data: ChangePasswordDto): Promise<void> {
    const user = await this.getOrError({ filter: { _id: userId } });

    const { currentPassword, confirmPassword } = data;

    if (!authService.validatePassword(user, currentPassword)) {
      throw new ConflictException('Current password is incorrect.');
    }

    if (authService.validatePassword(user, confirmPassword)) {
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
  }

  async updateProfile(userId: Id, data: UpdateProfileDto): Promise<User> {
    const user = await this.getOrError({ filter: { _id: userId } });

    user.fullName = data.fullName || user.fullName;
    user.phoneNumber = data.phoneNumber || user.phoneNumber;
    user.profileImage = data.profileImage || user.profileImage;

    return await user.save();
  }

  async deleteAccount(userId: Id): Promise<void> {
    const user = await this.model.findOneAndDelete({ _id: userId });
    if (!user) throw new ConflictException('User not found.');
  }

  async toggleActive(userId: Id): Promise<User> {
    const user = await this.getOrError({ filter: { _id: userId } });
    user.isActive = !user.isActive;
    return await user.save();
  }
}

export default new UserService();
