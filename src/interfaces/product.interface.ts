import { Id } from './core.interface';

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  inStock: boolean;
  categoryId: Id;
  quantity: number;
  image?: string;
}
