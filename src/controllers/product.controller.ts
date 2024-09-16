import { AuthPayload } from '@src/interfaces/auth.interface';
import productService from '@src/services/product.service';
import loggerUtil from '@src/utils/logger.util';
import { NextFunction, Request, Response } from 'express';

export default class ProductController {
  protected async index(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { queryOpts, pageOpts } = req;

      const data = await productService.getAll(pageOpts, queryOpts);

      return res.status(200).json({
        message: 'Products fetched successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in product index controller method: ${error}`);
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

      const data = await productService.getById(id);

      return res.status(200).json({
        message: 'Product fetched successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in product get single controller method: ${error}`);
      next(error);
    }
  }

  protected async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { body, user: authUser } = req;
      const data = await productService.create(authUser as AuthPayload, body);

      return res.status(201).json({
        message: 'Product created successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in product create controller method: ${error}`);
      next(error);
    }
  }

  protected async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { paramIds, body } = req;
      const { id } = paramIds || {};

      const data = await productService.update(id, body);

      return res.status(200).json({
        message: 'Product updated successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in product update controller method: ${error}`);
      next(error);
    }
  }

  protected async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { paramIds } = req;
      const { id } = paramIds || {};

      await productService.delete(id);

      return res.status(204).json({
        message: 'Product deleted successfully.',
      });
    } catch (error) {
      loggerUtil.log('error', `Error in product delete controller method: ${error}`);
      next(error);
    }
  }

  protected async toggleStock(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { paramIds } = req;
      const { id } = paramIds || {};

      const data = await productService.toggleStock(id);

      return res.status(200).json({
        message: 'Product stock updated successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in product toggle stock controller method: ${error}`);
      next(error);
    }
  }
}
