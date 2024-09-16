import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import Joi, { ValidationResult } from 'joi';
import serverConfig from '@src/config/server.config';
import { isObjectIdOrHexString, MongooseError, Types } from 'mongoose';
import loggerUtil from '@src/utils/logger.util';
import { BadRequestException, SystemException } from '@src/exceptions';
import { UserRole } from '@src/interfaces/enum.interface';
import { SortOrder } from '@src/interfaces/core.interface';

class SystemMiddlewares {
  public errorHandler(): ErrorRequestHandler {
    return (
      error: SystemException | Joi.ValidationError | Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const isProduction = serverConfig.NODE_ENV === 'production';

      // Default to status 500 if the error code is not set
      const errorCode =
        error instanceof SystemException && error.code && error.code >= 100 && error.code < 600
          ? error.code
          : 500;

      if (res.headersSent) {
        return next(error); // Ensure headers are not modified after being sent
      }

      // Handle validation errors specifically (like Joi validation errors)
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({
          message: 'Validation Error: Check your inputs.',
          errors: error.details.map((detail) => detail.message),
        });
      }

      // Log the error for debugging in production
      if (errorCode === 500 && isProduction) {
        loggerUtil.log('error', error.stack || error.message); // Log stack trace or message
        return res.status(500).json({
          message: "It's not you, it's us. We're working on it. Please try again later.",
        });
      }

      // General error handler
      return res.status(errorCode).json({
        message: error.message || 'An unexpected error occurred.',
        ...(error instanceof SystemException && error.errors && { errors: error.errors }),
        ...(error instanceof Error && !isProduction && { stack: error.stack }), // Only show stack in non-production
      });
    };
  }

  public formatRequestQuery(req: Request, _res: Response, next: NextFunction) {
    try {
      const {
        query: { limit, offset, search, category, inStock, sortBy, sortOrder, isActive, role },
      } = req;

      req.pageOpts = {
        limit: Number(limit) ? Number(limit) : 10,
        offset: Number(offset) ? Number(offset) : 0,
      };

      req.queryOpts = {
        category: category ? (category as string) : undefined,
        inStock: inStock ? inStock === 'true' : undefined,
        search: search ? (search as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : 'createdAt',
        sortOrder: sortOrder != 'asc' ? SortOrder.desc : SortOrder.asc,
        isActive: isActive ? isActive === 'true' : undefined,
        role: role ? UserRole[role as keyof typeof UserRole] : undefined,
      };

      return next();
    } catch (error) {
      loggerUtil.log('error', `Error in system middleware format request query: ${error}`);
      next(error);
    }
  }

  validateParamId(param: string) {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        const { params, paramIds } = req;

        if (!isObjectIdOrHexString(params[param])) {
          throw new BadRequestException(`Invalid ${param}`);
        }

        req.paramIds = { ...paramIds }; // clone
        req.paramIds[`${param}`] = new Types.ObjectId(params[param]);

        return next();
      } catch (error) {
        loggerUtil.log('error', `Error in system middleware validate request param Id: ${error}`);
        next(error);
      }
    };
  }

  public validateRequestBody = (validator: (req: Request) => ValidationResult) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const { error, value } = validator(req);

      if (error) next(error);
      req.body = value;

      next();
    };
  };
}

export default new SystemMiddlewares();
