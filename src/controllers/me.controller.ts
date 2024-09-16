import { Request, Response, NextFunction } from 'express';
import userService from '@src/services/user.service';
import loggerUtil from '@src/utils/logger.util';
import { AuthPayload } from '@src/interfaces/auth.interface';

export default class MeController {
  protected async index(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { user: authUser } = req;
      const userId = (authUser as AuthPayload).id;
      const user = await userService.getById(userId);
      return res.status(200).json({
        message: 'User profile retrieved successfully.',
        data: user,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in me index controller method: ${error}`);
      next(error);
    }
  }

  protected async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { user, body: data } = req;
      const userId = (user as AuthPayload).id;

      await userService.changePassword(userId, data);

      return res.status(200).json({
        message: 'Password updated successfully.',
      });
    } catch (error) {
      loggerUtil.log('error', `Error in me changePassword controller method: ${error}`);
      next(error);
    }
  }

  protected async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { user: authUser, body: data } = req;
      const userId = (authUser as AuthPayload).id;

      const user = await userService.updateProfile(userId, data);

      return res.status(200).json({
        message: 'Profile updated successfully.',
        data: user,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in me updateProfile controller method: ${error}`);
      next(error);
    }
  }

  protected async deleteAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { user } = req;
      const userId = (user as AuthPayload).id;

      await userService.deleteAccount(userId);

      return res.status(204).json({
        message: 'Account deleted successfully.',
      });
    } catch (error) {
      loggerUtil.log('error', `Error in me deactivate controller method: ${error}`);
      next(error);
    }
  }
}
