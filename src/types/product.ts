export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  badge?: string | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  archivedAt: Date | null;
};