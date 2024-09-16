import { PopulateOptions } from 'mongoose';
import { Document, FilterQuery, ProjectionType, Types } from 'mongoose';
import { UserRole } from '@src/interfaces/enum.interface';

export type Id = Types.ObjectId | string;

export type DocumentWithTimestamps = Document & {
  _id: Id;
  createdAt: Date;
  updatedAt: Date;
};

export interface QueryOptions {
  search?: string;
  category?: Id;
  featured?: boolean;
  inStock?: boolean;
  role?: UserRole;
  sortBy?: string;
  sortOrder?: SortOrder;
  isActive?: boolean;
}

export interface PageOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export interface PaginationMetadata {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface FindAllOption<T> {
  pageOpts?: PageOptions;
  sortBy?: keyof T;
  sortOrder?: SortOrder;
  filter?: FilterQuery<T>;
  fields?: ProjectionType<T>;
  relations?: PopulateOptions[];
}

export interface RelationOptions<T> {
  filter?: FilterQuery<T>;
  fields?: ProjectionType<T>;
  relations?: PopulateOptions[];
}

export enum SortOrder {
  asc = 1,
  desc = -1,
}
