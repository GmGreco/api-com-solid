import { Product, ProductStatus } from "../entities/Product";
export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findByIds(ids: string[]): Promise<Product[]>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findByCategory(
    categoryId: string,
    limit?: number,
    offset?: number
  ): Promise<Product[]>;
  search(query: string, limit?: number, offset?: number): Promise<Product[]>;
  findLowStock(threshold: number): Promise<Product[]>;
  updateStock(productId: string, quantity: number): Promise<void>;
  reserveStock(productId: string, quantity: number): Promise<boolean>;
  releaseStock(productId: string, quantity: number): Promise<void>;
}
export interface ProductFilters {
  categoryId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "price" | "name" | "createdAt" | "stock";
  sortOrder?: "asc" | "desc";
}
