import { Product } from "../../domain/entities/Product";
import { IProductRepository } from "../../domain/repositories/IProductRepository";

export interface GetProductByIdRequest {
  id: string;
}

export interface GetProductByIdResponse {
  success: boolean;
  product?: Product;
  error?: string;
}

export class GetProductByIdUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(
    request: GetProductByIdRequest
  ): Promise<GetProductByIdResponse> {
    try {
      // 1. Validar entrada
      if (!request.id) {
        return {
          success: false,
          error: "Product ID is required",
        };
      }

      // 2. Buscar produto
      const product = await this.productRepository.findById(request.id);

      if (!product) {
        return {
          success: false,
          error: "Product not found",
        };
      }

      return {
        success: true,
        product,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }
}
