import { AuthPayload } from '@src/interfaces/auth.interface';
import { Id, PageOptions, QueryOptions } from '@src/interfaces/core.interface';

declare module 'express' {
  export interface Request {
    queryOpts?: QueryOptions;
    pageOpts?: PageOptions;
    user?: AuthPayload;
    paramIds?: {
      [key: string]: Id;
    };
  }
}
