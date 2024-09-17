import { PopulateOptions } from 'mongoose';
import { Document, FilterQuery, ProjectionType, Types } from 'mongoose';
import { UserRole } from '@src/interfaces/enum.interface';

/**
 * Represents an ID, which can be a MongoDB ObjectId or a string.
 */
export type Id = Types.ObjectId | string;

/**
 * Document with timestamps including _id, createdAt, and updatedAt fields.
 */
export type DocumentWithTimestamps = Document & {
  _id: Id;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Options for querying resources, including filters and sorting.
 */
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

/**
 * Pagination options for limiting and offsetting results.
 */
export interface PageOptions {
  limit?: number;
  offset?: number;
}

/**
 * Result of a paginated query, containing items and metadata.
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMetadata;
}

/**
 * Metadata for pagination, such as total items and current page info.
 */
export interface PaginationMetadata {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Options for finding multiple documents in a paginated, filtered, and sorted manner.
 *
 * @template T - The type of the documents being queried.
 */
export interface FindAllOption<T> {
  /**
   * Pagination options for querying documents.
   * Defines the page number and limit for paginated results.
   */
  pageOpts?: PageOptions;

  /**
   * Specifies the field by which to sort the documents.
   * The key represents a field of type `T`.
   */
  sortBy?: keyof T;

  /**
   * Specifies the sort order, either ascending or descending.
   * Can be 'asc' or 'desc'.
   */
  sortOrder?: SortOrder;

  /**
   * A filter query to limit the documents retrieved based on specific conditions.
   * Accepts a filter query object for querying documents of type `T`.
   */
  filter?: FilterQuery<T>;

  /**
   * Fields to include or exclude in the returned documents.
   * Defines which fields of type `T` should be projected in the result set.
   */
  fields?: ProjectionType<T>;

  /**
   * Relations to populate, such as references to other collections or sub-documents.
   * Defines related documents or references that should be included with the result set.
   */
  relations?: PopulateOptions[];

  /**
   * Flag to indicate whether an optimized query should be executed.
   * For example, it could be used to optimize performance by skipping unnecessary processing.
   */
  optimized?: boolean;
}

/**
 * Options for handling related documents when querying.
 *
 * @template T - The type of the related documents being queried.
 */
export interface RelationOptions<T> {
  /**
   * A filter query to limit the related documents being retrieved based on specific conditions.
   * Accepts a filter query object for querying documents of type `T`.
   */
  filter?: FilterQuery<T>;

  /**
   * Fields to include or exclude in the returned related documents.
   * Defines which fields of type `T` should be projected in the result set.
   */
  fields?: ProjectionType<T>;

  /**
   * Relations to populate, such as references to other collections or sub-documents.
   * Defines related documents or references that should be included with the result set.
   */
  relations?: PopulateOptions[];
}

/**
 * Enum to represent the order of sorting: ascending or descending.
 *
 * - `asc` (1): Represents ascending order.
 * - `desc` (-1): Represents descending order.
 */
export enum SortOrder {
  asc = 1,
  desc = -1,
}
