import { Request } from 'express';
import { BaseValidator, Joi, ValidationResult } from '@src/validators';
import { LoginDto, ResetPasswordDto } from '@src/interfaces/auth.interface';

class AuthValidatorUtil extends BaseValidator {
  public login = (req: Request): ValidationResult => {
    const schema = Joi.object<LoginDto>().keys({
      email: Joi.string().email().lowercase().required().label('Email'),
      password: Joi.string().required().label('Password'),
    });

    return this.validate(schema, req.body);
  };

  public forgotPassword = (req: Request): ValidationResult => {
    const schema = Joi.object().keys({
      email: Joi.string().email().required().label('Email'),
    });

    return this.validate(schema, req.body);
  };

  public resetPassword = (req: Request): ValidationResult => {
    const schema = Joi.object<ResetPasswordDto>().keys({
      email: Joi.string().email().required().label('Email'),
      otp: Joi.string().required().min(6).label('OTP'),
      password: Joi.string().min(8).required().label('Password'),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .label('Confirm Password')
        .messages({
          'any.only': 'Passwords do not match.',
        }),
    });

    return this.validate(schema, req.body);
  };
}

export default new AuthValidatorUtil();
