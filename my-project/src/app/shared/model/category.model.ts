export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  translations?: any[];
  selected?: boolean;
  createdAt: string;
  updatedAt: string;
}