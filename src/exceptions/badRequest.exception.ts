import { SystemException } from '@src/exceptions/system.exception';

export class BadRequestException extends SystemException {
  constructor(message?: string) {
    super(400, message || 'Bad Request');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
