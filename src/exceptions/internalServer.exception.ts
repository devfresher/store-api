import { SystemException } from './index';

export default class InternalServerException extends SystemException {
  constructor(message: string, errors?: Array<unknown>) {
    super(500, message || 'Oops! an error occurred', errors);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
