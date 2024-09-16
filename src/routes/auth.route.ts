import { Router } from 'express';
import AuthController from '@src/controllers/auth.controller';
import authValidator from '@src/validators/auth.validator';
import systemMiddleware from '@src/middleware/system.middleware';

class AuthRoutes extends AuthController {
  public router: Router;

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router
      .route('/')
      .post(systemMiddleware.validateRequestBody(authValidator.login), this.login);

    this.router.post(
      '/forgot-password',
      systemMiddleware.validateRequestBody(authValidator.forgotPassword),
      this.forgotPassword
    );

    this.router.post(
      '/reset-password',
      systemMiddleware.validateRequestBody(authValidator.resetPassword),
      this.resetPassword
    );
  }
}

export default new AuthRoutes().router;
