import { UserRole } from '@src/interfaces/enum.interface';
import { CreateUserDto } from '@src/interfaces/user.interface';
import { BaseValidator, Joi, ValidationResult } from '@src/validators';
import { Request } from 'express';

class UserValidator extends BaseValidator {
  public create = (req: Request): ValidationResult => {
    const schema = Joi.object<CreateUserDto>().keys({
      fullName: Joi.string().required().label('Full Name'),
      email: Joi.string().email().required().label('Email'),
      phoneNumber: Joi.string().label('Phone Number'),
      profileImage: Joi.string().uri().label('Profile Image'),
      password: Joi.string().min(8).required().label('Password'),
      role: Joi.string()
        .valid(...Object.values(UserRole))
        .label('Role'),
    });
    return this.validate(schema, req.body);
  };
}

export default new UserValidator();
