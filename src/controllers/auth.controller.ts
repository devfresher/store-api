import { Request, Response, NextFunction } from 'express';
import authService from '@src/services/auth.service';
import loggerUtil from '@src/utils/logger.util';

export default class AuthController {
  protected async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { body: loginData } = req;

      const data = await authService.login(loginData);

      return res.status(200).json({
        message: 'Logged in successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in auth login controller method: ${error}`);
      next(error);
    }
  }

  protected async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const {
        body: { email },
      } = req;

      await authService.forgotPassword(email);

      return res.status(200).json({
        message: 'A link has been sent to your mail to reset your password.',
      });
    } catch (error) {
      loggerUtil.log('error', `Error in auth forgot password controller method: ${error}`);
      next(error);
    }
  }

  protected async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { body: data } = req;

      const user = await authService.resetPassword(data);

      const payload = await authService.login(user);

      return res.status(200).json({
        message: 'Your password has been reset successfully.',
        data: payload,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in auth reset password controller method: ${error}`);
      next(error);
    }
  }
}
