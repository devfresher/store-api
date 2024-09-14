import { FilterQuery, SortOrder } from 'mongoose';
import { Model } from 'mongoose';
import { PopulateOptions } from 'mongoose';
import { ClientSession } from 'mongoose';
import {
  DocumentWithTimestamps,
  FindAllOption,
  Id,
  PaginatedResult,
  PaginationMetadata,
  RelationOptions,
} from '@src/interfaces/core.interface';
import { ConflictException, NotFoundException } from '@src/exceptions';

abstract class BaseService<T extends DocumentWithTimestamps<T>> {
  constructor(
    private readonly entityName: string = 'Resource',
    private readonly model: Model<T>
  ) {}

  protected checkLabel = async (userId: Id, label: string): Promise<void> => {
    const record: T | null = await this.model.findOne({
      user: userId,
      label,
    });

    if (record) {
      throw new ConflictException(
        `${this.entityName} with this name already exists`
      );
    }
  };

  public count = async (
    filterQuery: FilterQuery<T>,
    session?: ClientSession
  ): Promise<number> => {
    return await this.model.countDocuments(filterQuery, session);
  };

  public getAllForService = async (
    opts?: FindAllOption<T>,
    session?: ClientSession
  ): Promise<T[] | PaginatedResult<T>> => {
    const offset = opts?.pageOpts ? opts?.pageOpts?.offset : 0;
    const limit = opts?.pageOpts ? opts?.pageOpts?.limit : 10;

    let items = await this.model.find(opts?.filter || {}, opts?.fields, {
      ...(offset && limit && { limit, skip: offset }),
      populate: opts?.relations,
      sort: {
        ...(opts?.sortBy && { [opts?.sortBy]: opts?.sortOrder }),
      },
      session,
    });

    if (!(offset && limit)) {
      return items;
    } else {
      const totalCount = await this.model.countDocuments(opts?.filter || {});
      const pagination = this.paginate(totalCount, offset, limit);
      return { items, pagination };
    }
  };

  async get(
    opts?: FindAllOption<T>,
    session?: ClientSession
  ): Promise<T | null> {
    return await this.model.findOne(opts?.filter || {}, opts?.fields, {
      populate: opts?.relations,
      session,
    });
  }

  async getOrError(
    opts?: FindAllOption<T>,
    session?: ClientSession
  ): Promise<T> {
    const entity = await this.model.findOne(opts?.filter || {}, opts?.fields, {
      populate: opts?.relations,
      session,
    });

    if (!entity)
      throw new NotFoundException(
        `This ${this.entityName.toLowerCase()} record could not be found`
      );

    return entity;
  }

  public deleteForService = async (
    filter: FilterQuery<T>,
    session?: ClientSession
  ): Promise<T> => {
    const record: T | null = await this.model.findOneAndDelete(filter, {
      session,
    });

    if (!record) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    return record;
  };

  protected generateRelation<U>(
    path: string,
    { fields, relations, filter }: RelationOptions<U> = {}
  ): PopulateOptions {
    return {
      path,
      select: fields,
      populate: relations,
      match: filter,
    };
  }

  private paginate(
    totalItems: number,
    offset: number,
    limit: number
  ): PaginationMetadata {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.ceil(offset / limit) + 1;
    const itemsPerPage = limit;

    return { totalItems, itemsPerPage, currentPage, totalPages };
  }
}

export default BaseService;
