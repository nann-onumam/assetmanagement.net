import { Category } from './category';

export interface Asset {
  id?: number;
  name: string;
  description: string;
  categoryId: number;
  value: number;
  category?: Category;
}