import { BadRequestException } from '@src/exceptions';
import { DocumentWithTimestamps, Id } from '@src/interfaces/core.interface';
import helperUtil from '@src/utils/helper.util';
import mongoose, { Schema, Model, CallbackError } from 'mongoose';
import { User } from './user.model';
import { Product } from './product.model';

export interface Category extends DocumentWithTimestamps {
  name: string;
  label: string;
  description?: string;
  isActive?: boolean;
  createdById: Id;
  createdBy?: User;
  productCount?: number;
  products?: Product[];
}

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, index: true },
    label: { type: String, required: true, unique: true, index: true },
    description: { type: String, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre<Category>('validate', async function (next) {
  try {
    if (this.isModified('name')) {
      const label = helperUtil.getLabel(this.name);
      const existingCategory = await CategoryModel.findOne({ label });

      if (existingCategory && existingCategory._id.toString() !== this._id) {
        throw new BadRequestException('Product category already exists');
      }

      this.label = label;
    }
    next();
  } catch (error) {
    return next(error as CallbackError);
  }
});

categorySchema.virtual('createdBy', {
  ref: 'User',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true,
});

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
  justOne: false,
  limit: 5,
});

categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId',
  count: true,
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

interface CategoryModel extends Model<Category> {}
const CategoryModel = mongoose.model<Category, CategoryModel>('Category', categorySchema);
export default CategoryModel;
