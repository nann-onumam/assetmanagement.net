import { Category } from './category';

export interface Asset {
  id?: number;
  name: string;
  description?: string;
  model: string;
  value: number;
  categoryId: number;
  category?: Category;
  status?: 'Available' | 'Borrowed' | 'Maintenance' | 'Retired';
}