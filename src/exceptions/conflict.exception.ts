import { SystemException } from '@src/exceptions/system.exception';

export class ConflictException extends SystemException {
  constructor(message: string) {
    super(409, message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
