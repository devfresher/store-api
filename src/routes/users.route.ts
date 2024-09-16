import UserController from '@src/controllers/user.controller';
import systemMiddleware from '@src/middleware/system.middleware';
import userValidator from '@src/validators/user.validator';
import { Router } from 'express';

class UsersRoutes extends UserController {
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
      .post(systemMiddleware.validateRequestBody(userValidator.create), this.create);

    this.router
      .route('/:id')
      .get(systemMiddleware.validateParamId('id'), this.getSingle)
      .patch(systemMiddleware.validateParamId('id'), this.toggleStatus);
  }
}

export default new UsersRoutes().router;
