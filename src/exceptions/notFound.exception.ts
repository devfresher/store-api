import { SystemException } from './index';

export default class NotFoundException extends SystemException {
  constructor(message?: string) {
    super(404, message || 'Resource not found.');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
