import { Router, Request, Response } from 'express';
import systemMiddleware from '@src/middleware/system.middleware';
import authRoutes from '@src/routes/auth.route';
import meRoutes from '@src/routes/me.route';
import authMiddleware from '@src/middleware/auth.middleware';
import categoriesRoutes from '@src/routes/categories.route';
import productsRoutes from '@src/routes/products.route';
import usersRoutes from '@src/routes/users.route';
import serverConfig from '@src/config/server.config';
import { NotFoundException } from '@src/exceptions';
import { UserRole } from '@src/interfaces/enum.interface';

class Routes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.get('/', this.index);

    this.router.use(systemMiddleware.formatRequestQuery);

    this.router.use('/auth', authRoutes);

    this.router.use('/me', authMiddleware.validateUserAccess, meRoutes);

    this.router.use(
      '/users',
      authMiddleware.validateUserAccess,
      authMiddleware.validateUserRole([UserRole.admin]),
      usersRoutes
    );

    this.router.use('/categories', categoriesRoutes);

    this.router.use('/products', productsRoutes);

    this.router.use('*', (req) => {
      throw new NotFoundException(
        `You missed the road. Can not ${req.method} ${req.originalUrl} on this server `
      );
    });
  }

  private index(_req: Request, res: Response) {
    return res.status(200).json({
      message: `Yea! we're up and running`,
      data: {
        port: serverConfig.PORT,
        environment: serverConfig.NODE_ENV,
      },
    });
  }
}

export default new Routes().router;
