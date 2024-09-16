import ProductModel, { Product } from '@src/db/models/product.model';
import { AuthPayload } from '@src/interfaces/auth.interface';
import {
  FindAllOption,
  Id,
  PageOptions,
  PaginatedResult,
  QueryOptions,
} from '@src/interfaces/core.interface';
import { CreateProductDto } from '@src/interfaces/product.interface';
import BaseService from '@src/services';
import categoryService from './category.service';

class ProductService extends BaseService<Product> {
  constructor() {
    super('Product', ProductModel);
  }

  defaultRelations = [
    this.generateRelation('category', { fields: ['name', 'description'] }),
    this.generateRelation('createdBy', {
      fields: ['fullName', 'email', 'profileImage'],
    }),
  ];

  async getAll(
    pageOpts?: PageOptions,
    queryOpts?: QueryOptions
  ): Promise<Product[] | PaginatedResult<Product>> {
    const options: FindAllOption<Product> = {
      pageOpts,
      relations: this.defaultRelations,
      sortBy: queryOpts?.sortBy as keyof Product,
      sortOrder: queryOpts?.sortOrder,
      filter: {
        ...(queryOpts?.inStock !== undefined && {
          inStock: queryOpts?.inStock,
        }),
        ...(queryOpts?.category && { categoryId: queryOpts?.category }),
      },
    };

    if (queryOpts?.search) {
      options.filter = {
        $or: [
          { name: { $regex: queryOpts.search, $options: 'i' } },
          { label: { $regex: queryOpts.search, $options: 'i' } },
          { description: { $regex: queryOpts.search, $options: 'i' } },
        ],
      };
    }

    const products = await this.getAllForService(options);
    return products;
  }

  async getById(id: Id): Promise<Product> {
    const product = await this.getOrError({
      filter: { _id: id },
      relations: this.defaultRelations,
    });
    return product;
  }

  async create(authUser: AuthPayload, data: CreateProductDto): Promise<Product> {
    const category = await categoryService.getById(data.categoryId);

    const product = await this.model.create({
      ...data,
      categoryId: category.id,
      createdById: authUser.id,
    });

    return product;
  }

  async update(id: Id, data: CreateProductDto): Promise<Product> {
    const session = await this.model.startSession();
    session.startTransaction();

    try {
      if (data.categoryId) await categoryService.getById(data.categoryId);

      const product = await this.getOrError({ filter: { _id: id } }, session);
      Object.assign(product, data);
      await product.save({ ...((await this.isReplicaSet()) && { session }) });
      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }
  }

  async delete(id: Id): Promise<void> {
    const session = await this.model.startSession();
    session.startTransaction();

    try {
      const product = await this.getOrError({ filter: { _id: id } }, session);
      await product.deleteOne();
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }
  }

  async toggleStock(id: Id): Promise<Product> {
    const session = await this.model.startSession();
    session.startTransaction();

    try {
      const product = await this.getOrError({ filter: { _id: id } }, session);
      product.inStock = !product.inStock;
      await product.save();
      await session.commitTransaction();
      return product;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }
  }
}

export default new ProductService();
