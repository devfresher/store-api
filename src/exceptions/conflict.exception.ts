import { SystemException } from './index';

export default class ConflictException extends SystemException {
  constructor(message: string) {
    super(409, message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
