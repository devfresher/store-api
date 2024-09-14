export default class SystemException extends Error {
  private _code?: number;

  private _errors?: Array<unknown>;

  get code(): number | undefined {
    return this._code;
  }

  get errors(): Array<unknown> | undefined {
    return this._errors;
  }

  constructor(
    code: number,
    message: string = 'an error occurred',
    errors?: Array<unknown>
  ) {
    super(message); // 'Error' breaks prototype chain here
    this._code = code || 500;
    this.message = message;
    this._errors = errors;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
