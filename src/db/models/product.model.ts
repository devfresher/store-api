import { DocumentWithTimestamps, Id } from '@src/interfaces/core.interface';
import { Category } from './category.model';
import { User } from './user.model';
import mongoose, { CallbackError, Model, Schema } from 'mongoose';
import { BadRequestException } from '@src/exceptions';
import helperUtil from '@src/utils/helper.util';

export interface Product extends DocumentWithTimestamps {
  name: string;
  label: string;
  description?: string;
  categoryId: Id;
  createdById: Id;
  price: number;
  quantity: number;
  image?: string;
  inStock?: boolean;
  category?: Category;
  createdBy?: User;
}

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true, index: true },
    label: { type: String, required: true, unique: true, index: true },
    description: { type: String, index: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    image: { type: String },
  },
  { timestamps: true }
);

productSchema.pre<Product>('validate', async function (next) {
  try {
    if (this.isModified('name')) {
      const label = helperUtil.getLabel(this.name);
      const existingProduct = await ProductModel.findOne({ label });

      if (existingProduct) {
        throw new BadRequestException('Product already exists');
      }

      this.label = label;
    }
    next();
  } catch (error) {
    return next(error as CallbackError);
  }
});

productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

productSchema.virtual('createdBy', {
  ref: 'User',
  localField: 'createdById',
  foreignField: '_id',
  justOne: true,
});

productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

interface ProductModel extends Model<Product> {}
const ProductModel = mongoose.model<Product, ProductModel>('Product', productSchema);
export default ProductModel;
