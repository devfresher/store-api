import { Types } from 'mongoose';

export type Id = Types.ObjectId | string;

export interface QueryOptions {
  search?: string;
  category?: string;
  featured?: boolean;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface PageOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
}
