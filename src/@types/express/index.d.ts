import { User } from '@src/db/models/user.model';
import { Id, PageOptions, QueryOptions } from '@src/interfaces/core.interface';

declare module 'express' {
  export interface Request {
    queryOpts?: QueryOptions;
    pageOpts?: PageOptions;
    user?: User;
    paramIds?: {
      [key: string]: Id;
    };
  }
}
