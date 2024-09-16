import joi, { ValidationOptions } from 'joi';
import mongoose, { isValidObjectId } from 'mongoose';

export { ValidationResult } from 'joi';
export class BaseValidator {
  private validationOption: ValidationOptions = {
    errors: {
      wrap: {
        label: '',
      },
    },
    abortEarly: false,
  };

  protected patterns = {
    phoneNumber: /^(?:\+234|0)(?:70|80|81|90|91)\d{8}$/,
  };

  protected validate = (schema: joi.AnySchema, payload: unknown) => {
    return schema.validate(payload, this.validationOption);
  };
}

export const Joi: typeof joi = joi.extend((joi) => ({
  type: 'objectId',
  base: joi.string(),
  messages: {
    'objectId.invalid': '{{#label}} must be a valid {{#label}} Id',
  },
  validate(value, helpers) {
    if (!isValidObjectId(value)) {
      return {
        value,
        errors: helpers.error('objectId.invalid'),
      };
    }
  },
}));
