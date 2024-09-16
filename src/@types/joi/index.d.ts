import { StringSchema } from 'joi';

declare module 'joi' {
  export interface Root {
    objectId<TSchema = string>(): StringSchema<TSchema>;
  }
}
