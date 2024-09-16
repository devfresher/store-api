import { Request } from 'express';
import { BaseValidator, Joi, ValidationResult } from '@src/validators';
import { CreateCategoryDto } from '@src/interfaces/category.interface';

class CategoryValidator extends BaseValidator {
  public create = (req: Request): ValidationResult => {
    const schema = Joi.object<CreateCategoryDto>().keys({
      name: Joi.string().required().label('Name'),
      description: Joi.string().label('Description'),
    });
    return this.validate(schema, req.body);
  };

  public update = (req: Request): ValidationResult => {
    const schema = Joi.object<CreateCategoryDto>().keys({
      name: Joi.string().label('Name'),
      description: Joi.string().label('Description'),
    });
    return this.validate(schema, req.body);
  };
}

export default new CategoryValidator();
