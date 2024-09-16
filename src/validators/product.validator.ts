import { CreateProductDto } from '@src/interfaces/product.interface';
import { BaseValidator, Joi, ValidationResult } from '@src/validators';
import { Request } from 'express';

class ProductValidator extends BaseValidator {
  public create = (req: Request): ValidationResult => {
    const schema = Joi.object<CreateProductDto>().keys({
      name: Joi.string().required().label('Name'),
      description: Joi.string().label('Description'),
      price: Joi.number().min(0).required().label('Price'),
      quantity: Joi.number().min(0).required().label('Quantity'),
      categoryId: Joi.objectId().required().label('Category'),
      image: Joi.string().label('Image'),
      inStock: Joi.boolean().label('In Stock'),
    });
    return this.validate(schema, req.body);
  };

  public update = (req: Request): ValidationResult => {
    const schema = Joi.object<CreateProductDto>().keys({
      name: Joi.string().label('Name'),
      description: Joi.string().label('Description'),
      price: Joi.number().min(0).label('Price'),
      quantity: Joi.number().min(0).label('Quantity'),
      categoryId: Joi.objectId().label('Category'),
      image: Joi.string().label('Image'),
      inStock: Joi.boolean().label('In Stock'),
    });
    return this.validate(schema, req.body);
  };
}

export default new ProductValidator();
