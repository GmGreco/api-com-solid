import { Product } from "../../domain/entities/Product";
import {
  IProductRepository,
  ProductFilters,
} from "../../domain/repositories/IProductRepository";

export interface GetProductsRequest {
  limit?: number;
  offset?: number;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price" | "name" | "createdAt" | "stock";
  sortOrder?: "asc" | "desc";
}

export interface GetProductsResponse {
  success: boolean;
  products?: Product[];
  total?: number;
  error?: string;
}

export class GetProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(request: GetProductsRequest): Promise<GetProductsResponse> {
    try {
      // 1. Preparar filtros
      const filters: ProductFilters = {
        limit: request.limit || 50,
        offset: request.offset || 0,
        categoryId: request.categoryId,
        status: request.status as any,
        minPrice: request.minPrice,
        maxPrice: request.maxPrice,
        inStock: request.inStock,
        sortBy: request.sortBy,
        sortOrder: request.sortOrder,
      };

      // 2. Buscar produtos
      const products = await this.productRepository.findAll(filters);

      return {
        success: true,
        products,
        total: products.length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }
}
