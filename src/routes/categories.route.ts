import { Router } from 'express';
import CategoryController from '@src/controllers/category.controller';
import { UserRole } from '@src/interfaces/enum.interface';
import authMiddleware from '@src/middleware/auth.middleware';
import systemMiddleware from '@src/middleware/system.middleware';
import categoryValidator from '@src/validators/category.validator';

class CategoryRoutes extends CategoryController {
  public router: Router;
  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.route('/').get(this.index);

    this.router.route('/:id').get(systemMiddleware.validateParamId('id'), this.getSingle);

    this.router
      .route('/:id/products')
      .get(systemMiddleware.validateParamId('id'), this.getProducts);

    // Handle user access validation
    this.router.use(
      authMiddleware.validateUserAccess,
      authMiddleware.validateUserRole([UserRole.admin])
    );

    this.router
      .route('/')
      .post(systemMiddleware.validateRequestBody(categoryValidator.create), this.create);

    this.router
      .route('/:id')
      .put(
        systemMiddleware.validateParamId('id'),
        systemMiddleware.validateRequestBody(categoryValidator.update),
        this.update
      )
      .patch(systemMiddleware.validateParamId('id'), this.toggleStatus)
      .delete(systemMiddleware.validateParamId('id'), this.delete);
  }
}

export default new CategoryRoutes().router;
