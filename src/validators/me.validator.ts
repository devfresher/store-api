import { Request } from 'express';
import { BaseValidator, Joi, ValidationResult } from '@src/validators';
import { ChangePasswordDto, UpdateProfileDto } from '@src/interfaces/user.interface';

class MeValidatorUtil extends BaseValidator {
  public changePassword = (req: Request): ValidationResult => {
    const schema = Joi.object<ChangePasswordDto>().keys({
      currentPassword: Joi.string().required().label('Current Password'),
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

  public updateProfile = (req: Request): ValidationResult => {
    const schema = Joi.object<UpdateProfileDto>().keys({
      fullName: Joi.string().label('Full Name'),
      phoneNumber: Joi.string().pattern(this.patterns.phoneNumber).label('Phone Number').messages({
        'string.pattern.base': 'Invalid phone number',
      }),
      profileImage: Joi.string().uri().label('Profile Image'),
    });

    return this.validate(schema, req.body);
  };
}

export default new MeValidatorUtil();
