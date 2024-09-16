import ProductController from '@src/controllers/product.controller';
import { UserRole } from '@src/interfaces/enum.interface';
import authMiddleware from '@src/middleware/auth.middleware';
import systemMiddleware from '@src/middleware/system.middleware';
import productValidator from '@src/validators/product.validator';
import { Router } from 'express';

class ProductsRoute extends ProductController {
  public router: Router;
  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.route('/').get(this.index);

    this.router.route('/:id').get(systemMiddleware.validateParamId('id'), this.getSingle);

    // Handle user access validation
    this.router.use(
      authMiddleware.validateUserAccess,
      authMiddleware.validateUserRole([UserRole.admin])
    );

    this.router
      .route('/')
      .post(systemMiddleware.validateRequestBody(productValidator.create), this.create);

    this.router
      .route('/:id')
      .put(
        systemMiddleware.validateParamId('id'),
        systemMiddleware.validateRequestBody(productValidator.update),
        this.update
      )
      .patch(systemMiddleware.validateParamId('id'), this.toggleStock)
      .delete(systemMiddleware.validateParamId('id'), this.delete);
  }
}

export default new ProductsRoute().router;
