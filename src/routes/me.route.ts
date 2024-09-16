import { Router } from 'express';
import MeController from '@src/controllers/me.controller';
import systemMiddleware from '@src/middleware/system.middleware';

import meValidator from '@src/validators/me.validator';

class MeRoutes extends MeController {
  public router: Router;

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router
      .route('/')
      .get(this.index)
      .put(systemMiddleware.validateRequestBody(meValidator.updateProfile), this.updateProfile)
      .delete(this.deleteAccount);

    this.router.patch(
      '/change-password',
      systemMiddleware.validateRequestBody(meValidator.changePassword),
      this.changePassword
    );
  }
}

export default new MeRoutes().router;
