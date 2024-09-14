import { SystemException } from './index';

export default class BadRequestException extends SystemException {
  constructor(message?: string) {
    super(400, message || 'Bad Request');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
