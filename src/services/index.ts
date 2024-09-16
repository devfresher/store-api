import mongoose, { FilterQuery } from 'mongoose';
import { Model } from 'mongoose';
import { PopulateOptions } from 'mongoose';
import { ClientSession } from 'mongoose';
import {
  DocumentWithTimestamps,
  FindAllOption,
  PaginatedResult,
  PaginationMetadata,
  RelationOptions,
} from '@src/interfaces/core.interface';
import { ConflictException, NotFoundException } from '@src/exceptions';

abstract class BaseService<T extends DocumentWithTimestamps> {
  constructor(
    private readonly entityName: string = 'Resource',
    protected readonly model: Model<T>
  ) {}

  protected async checkLabel(label: string): Promise<void> {
    const record: T | null = await this.model.findOne({
      label,
    });

    if (record) {
      throw new ConflictException(`${this.entityName} with this name already exists`);
    }
  }

  public async count(filterQuery: FilterQuery<T>, session?: ClientSession): Promise<number> {
    return await this.model.countDocuments(filterQuery, session);
  }

  public async getAllForService(
    opts?: FindAllOption<T>,
    session?: ClientSession
  ): Promise<T[] | PaginatedResult<T>> {
    const offset = opts?.pageOpts?.offset || 0;
    const limit = opts?.pageOpts?.limit || 10;

    const isReplicaSet = await this.isReplicaSet();

    let items = await this.model.find(opts?.filter || {}, opts?.fields, {
      ...(limit && { limit, skip: offset }),
      populate: opts?.relations,
      sort: {
        ...(opts?.sortBy && { [opts?.sortBy]: opts?.sortOrder }),
      },
      ...(isReplicaSet && { session }),
    });

    if (!limit) {
      return items;
    } else {
      const totalCount = await this.model.countDocuments(opts?.filter || {});
      const pagination = this.paginate(totalCount, offset, limit);
      return { items, pagination };
    }
  }

  async get(opts?: FindAllOption<T>, session?: ClientSession): Promise<T | null> {
    const isReplicaSet = await this.isReplicaSet();

    return await this.model.findOne(opts?.filter || {}, opts?.fields, {
      populate: opts?.relations,
      ...(isReplicaSet && { session }),
    });
  }

  async getOrError(opts?: FindAllOption<T>, session?: ClientSession): Promise<T> {
    const isReplicaSet = await this.isReplicaSet();

    const entity = await this.model.findOne(opts?.filter || {}, opts?.fields, {
      populate: opts?.relations,
      ...(isReplicaSet && { session }),
    });

    if (!entity)
      throw new NotFoundException(
        `This ${this.entityName.toLowerCase()} record could not be found`
      );

    return entity;
  }

  public async deleteForService(filter: FilterQuery<T>, session?: ClientSession): Promise<T> {
    const isReplicaSet = await this.isReplicaSet();

    const record: T | null = await this.model.findOneAndDelete(filter, {
      ...(isReplicaSet && { session }),
    });

    if (!record) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    return record;
  }

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

  private paginate(totalItems: number, offset: number, limit: number): PaginationMetadata {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.ceil(offset / limit) + 1;
    const itemsPerPage = limit;

    return { totalItems, itemsPerPage, currentPage, totalPages };
  }

  protected async isReplicaSet(): Promise<boolean> {
    const admin = mongoose.connection?.db?.admin();
    const result = await admin?.command({ isMaster: 1 });
    return !!result?.setName;
  }
}

export default BaseService;
