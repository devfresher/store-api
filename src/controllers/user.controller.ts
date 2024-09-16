import userService from '@src/services/user.service';
import loggerUtil from '@src/utils/logger.util';
import { NextFunction, Request, Response } from 'express';

export default class UserController {
  protected async index(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { queryOpts, pageOpts } = req;

      const data = await userService.getAll(pageOpts, queryOpts);

      return res.status(200).json({
        message: 'Users fetched successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in user index controller method: ${error}`);
      next(error);
    }
  }

  protected async getSingle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { paramIds } = req;
      const { id } = paramIds || {};

      const data = await userService.getById(id);

      return res.status(200).json({
        message: 'User fetched successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in user get single controller method: ${error}`);
      next(error);
    }
  }

  protected async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { body } = req;
      const data = await userService.create(body);

      return res.status(201).json({
        message: 'User created successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in user create controller method: ${error}`);
      next(error);
    }
  }

  protected async toggleStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { paramIds } = req;
      const { id } = paramIds || {};

      const data = await userService.toggleActive(id);

      return res.status(200).json({
        message: 'User status updated successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in user toggle status controller method: ${error}`);
      next(error);
    }
  }
}
