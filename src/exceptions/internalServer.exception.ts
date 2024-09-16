import { SystemException } from '@src/exceptions/system.exception';

export class InternalServerException extends SystemException {
  constructor(message: string, errors?: Array<unknown>) {
    super(500, message || 'Oops! an error occurred', errors);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
