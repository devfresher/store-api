import { AuthPayload } from '@src/interfaces/auth.interface';
import categoryService from '@src/services/category.service';
import productService from '@src/services/product.service';
import loggerUtil from '@src/utils/logger.util';
import { NextFunction, Request, Response } from 'express';

export default class CategoryController {
  protected async index(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { queryOpts, pageOpts } = req;

      const data = await categoryService.getAll(pageOpts, queryOpts);

      return res.status(200).json({
        message: 'Categories fetched successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in category index controller method: ${error}`);
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

      const data = await categoryService.getById(id);

      return res.status(200).json({
        message: 'Category fetched successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in category get single controller method: ${error}`);
      next(error);
    }
  }

  protected async getProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { paramIds, pageOpts, queryOpts: query } = req;
      const id = paramIds?.id;

      const queryOpts = {
        ...query,
        categoryId: id,
      };

      const data = await productService.getAll(pageOpts, queryOpts);

      return res.status(200).json({
        message: 'Products fetched successfully.',
        data,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in category get products controller method: ${error}`);
      next(error);
    }
  }

  protected async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { body: data, user: authUser } = req;

      const category = await categoryService.create(authUser as AuthPayload, data);

      return res.status(201).json({
        message: 'Category created successfully.',
        data: category,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in category create controller method: ${error}`);
      next(error);
    }
  }

  protected async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { body: data, paramIds } = req;
      const { id } = paramIds || {};

      const category = await categoryService.update(id, data);

      return res.status(200).json({
        message: 'Category updated successfully.',
        data: category,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in category update controller method: ${error}`);
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

      const category = await categoryService.toggleStatus(id);

      return res.status(200).json({
        message: 'Category status updated successfully.',
        data: category,
      });
    } catch (error) {
      loggerUtil.log('error', `Error in category toggle status controller method: ${error}`);
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

      await categoryService.delete(id);

      return res.status(204).json({
        message: 'Category deleted successfully.',
      });
    } catch (error) {
      loggerUtil.log('error', `Error in category delete controller method: ${error}`);
      next(error);
    }
  }
}
