import { SystemException } from '@src/exceptions/system.exception';

export class ForbiddenException extends SystemException {
  constructor(message?: string) {
    super(403, message || 'Access Denied');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
