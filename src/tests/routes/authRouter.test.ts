import { Response, Router } from 'express';
import authRoutes from '@src/routes/auth.route';
import systemMiddleware from '@src/middleware/system.middleware';
import authValidator from '@src/validators/auth.validator';
import AuthController from '@src/controllers/auth.controller';

const mockRequest = () => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    get: jest.fn(),
    header: jest.fn(),
  } as unknown as Request;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthRoutes', () => {
  let router: Router;

  beforeEach(() => {
    router = authRoutes;
  });

  it('should define the "/" route with a POST method', () => {
    expect(router.stack.some((layer) => layer.route?.path === '/' && layer.route?.post)).toBe(true);
  });

  it('should define the "/forgot-password" route with a POST method', () => {
    expect(
      router.stack.some((layer) => layer.route?.path === '/forgot-password' && layer.route?.post)
    ).toBe(true);
  });

  it('should define the "/reset-password" route with a POST method', () => {
    expect(
      router.stack.some((layer) => layer.route?.path === '/reset-password' && layer.route?.post)
    ).toBe(true);
  });

  it('should call systemMiddleware.validateRequestBody for each route', () => {
    const spy = jest.spyOn(systemMiddleware, 'validateRequestBody');

    router.stack.forEach((layer) => {
      if (layer.route?.path === '/') {
        expect(spy).toHaveBeenCalledWith(authValidator.login);
      } else if (layer.route?.path === '/forgot-password') {
        expect(spy).toHaveBeenCalledWith(authValidator.forgotPassword);
      } else if (layer.route?.path === '/reset-password') {
        expect(spy).toHaveBeenCalledWith(authValidator.resetPassword);
      }
    });

    // Validate that the spy was called for all routes
    expect(spy).toHaveBeenCalledTimes(3); // One call per route
  });

  //   it('should call the corresponding controller method for each route', () => {
  //     const loginSpy = jest.spyOn(AuthController.prototype as any, 'login' as any);
  //     const forgotPasswordSpy = jest.spyOn(AuthController.prototype as any, 'forgotPassword' as any);
  //     const resetPasswordSpy = jest.spyOn(AuthController.prototype as any, 'resetPassword' as any);

  //     router.stack.forEach((layer) => {
  //       const handler = layer.route?.stack[1]?.handle; // 2nd layer is the actual controller method after middleware

  //       if (handler) {
  //         const req = mockRequest();
  //         const res = mockResponse();

  //         if (layer.route?.path === '/') {
  //           handler(req, res, () => {});
  //           expect(loginSpy).toHaveBeenCalledTimes(1);
  //         } else if (layer.route?.path === '/forgot-password') {
  //           handler(req, res, () => {});
  //           expect(forgotPasswordSpy).toHaveBeenCalledTimes(1);
  //         } else if (layer.route?.path === '/reset-password') {
  //           handler(req, res, () => {});
  //           expect(resetPasswordSpy).toHaveBeenCalledTimes(1);
  //         }
  //       }
  //     });
  //   });
});
