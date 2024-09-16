import CategoryModel, { Category } from '@src/db/models/category.model';
import BaseService from '.';
import {
  FindAllOption,
  Id,
  PageOptions,
  PaginatedResult,
  QueryOptions,
} from '@src/interfaces/core.interface';
import { CreateCategoryDto } from '@src/interfaces/category.interface';
import { AuthPayload } from '@src/interfaces/auth.interface';

class CategoryService extends BaseService<Category> {
  constructor() {
    super('Category', CategoryModel);
  }

  defaultRelations = [
    this.generateRelation('createdBy', {
      fields: ['name', 'email', 'profileImage'],
    }),
    this.generateRelation('products', {
      fields: ['name', 'description', 'price', 'inStock', 'image'],
    }),
    this.generateRelation('productCount'),
  ];

  async getAll(
    pageOpts?: PageOptions,
    queryOpts?: QueryOptions
  ): Promise<Category[] | PaginatedResult<Category>> {
    const options: FindAllOption<Category> = {
      pageOpts,
      relations: this.defaultRelations,
      sortBy: queryOpts?.sortBy as keyof Category,
      sortOrder: queryOpts?.sortOrder,
      filter: {
        ...(queryOpts?.isActive && { isActive: queryOpts?.isActive }),
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

    const categories = await this.getAllForService(options);
    return categories;
  }

  async getById(id: Id): Promise<Category> {
    const category = await this.getOrError({
      filter: { _id: id },
      relations: this.defaultRelations,
    });
    return category;
  }

  async create(authUser: AuthPayload, data: CreateCategoryDto): Promise<Category> {
    const category = await this.model.create({
      ...data,
      createdById: authUser.id,
    });

    return category;
  }

  async update(id: Id, data: CreateCategoryDto): Promise<Category | undefined> {
    const session = await this.model.startSession();
    session.startTransaction();

    try {
      const category = await this.getOrError({ filter: { _id: id } }, session);
      Object.assign(category, data);
      await category.save({ ...((await this.isReplicaSet()) && { session }) });
      await session.commitTransaction();
      return category;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async delete(id: Id): Promise<Category> {
    const category = await this.deleteForService({ _id: id });
    return category;
  }

  async toggleStatus(id: Id): Promise<Category> {
    const session = await this.model.startSession();
    session.startTransaction();

    try {
      const category = await this.getOrError({ filter: { _id: id } }, session);
      category.isActive = !category.isActive;
      await category.save({ ...((await this.isReplicaSet()) && { session }) });
      await session.commitTransaction();
      return category;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new CategoryService();
