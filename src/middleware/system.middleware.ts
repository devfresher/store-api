import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import Joi, { ValidationResult } from 'joi';
import serverConfig from '@src/config/server.config';
import { isObjectIdOrHexString, Types } from 'mongoose';
import loggerUtil from '@src/utils/logger.util';
import { BadRequestException, SystemException } from '@src/exceptions';

class SystemMiddlewares {
  public errorHandler(): ErrorRequestHandler {
    return (
      error: SystemException,
      _req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const isProduction = serverConfig.NODE_ENV === 'production';
      const errorCode = error.code || 500;
      let errorMessage: SystemException | object = {};

      if (res.headersSent) {
        next(error);
      }

      if (!isProduction) {
        loggerUtil.log('error', error.stack);
        errorMessage = error;
      }

      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({
          message: 'Validation error.',
          error: error.details.map((detail) => {
            return detail.message;
          }),
        });
      }

      if (errorCode === 500 && isProduction) {
        return res.status(500).json({
          message:
            "It's not you, it's us. We're working on it. Please try again later.",
        });
      }

      return res.status(errorCode).json({
        message: error.message,
        error: {
          ...(error.errors && { error: error.errors }),
          ...(!isProduction && { trace: errorMessage }),
        },
      });
    };
  }

  public formatRequestQuery(req: Request, _res: Response, next: NextFunction) {
    try {
      const {
        query: { limit, offset, search, category, inStock },
      } = req;

      req.pageOpts = {
        limit: Number(limit) ? Number(limit) : 10,
        offset: Number(offset) ? Number(offset) : 0,
      };

      req.queryOpts = {
        category: category ? (category as string) : undefined,
        inStock: inStock === 'true' ? true : false,
        search: search ? (search as string) : undefined,
      };

      return next();
    } catch (error) {
      loggerUtil.log(
        'error',
        `Error in system middleware format request query: ${error}`
      );
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
        loggerUtil.log(
          'error',
          `Error in system middleware validate request param Id: ${error}`
        );
        next(error);
      }
    };
  }

  public validateRequestBody = (
    validator: (req: Request) => ValidationResult
  ) => {
    return (req: Request, _res: Response, next: NextFunction) => {
      const { error, value } = validator(req);

      if (error) next(error);
      req.body = value;

      next();
    };
  };
}

export default new SystemMiddlewares();
