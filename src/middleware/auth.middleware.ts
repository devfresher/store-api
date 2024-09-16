import { Request, Response, NextFunction, RequestHandler } from 'express';
import authenticateService from '@src/services/auth.service';
import loggerUtil from '@src/utils/logger.util';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@src/exceptions';

class AuthenticationMiddleware {
  public async validateUserAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { authorization } = req.headers;
      if (!authorization) throw new BadRequestException('No token provided.');

      let token: string;
      if (authorization.startsWith('Bearer ')) {
        [, token] = authorization.split(' ');
      } else {
        token = authorization;
      }

      if (!token) throw new BadRequestException('No token provided.');

      const { payload, expired } = authenticateService.verifyAccessToken(token);

      if (expired) throw new UnauthorizedException('Please provide a valid token.');

      if (!payload?.isActive) throw new UnauthorizedException('Account is currently not active');

      req.user = payload;

      return next();
    } catch (error) {
      loggerUtil.log(
        'error',
        `Error in authentication middleware validate user access method: ${error}`
      );
      next(error);
    }
  }

  public validateUserRole(allowedRoles: string[]): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { user } = req;
        if (!user || !user.role || !allowedRoles.includes(user.role)) {
          throw new ForbiddenException(`Access denied for ${user?.role}.`);
        }

        return next();
      } catch (error) {
        loggerUtil.log('error', `Error in validateUserRole middleware: ${error}`);
        next(error);
      }
    };
  }
}

export default new AuthenticationMiddleware();
