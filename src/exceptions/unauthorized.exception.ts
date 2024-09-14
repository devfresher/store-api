import { SystemException } from './index';

export default class UnauthorizedException extends SystemException {
  constructor(message?: string) {
    super(401, message || 'You are not authorized to access this resource.');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
