import { Product } from "../../domain/entities/Product";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import {
  ProductFactoryCreator,
  ProductType,
  ProductConfig,
  PhysicalProductConfig,
  DigitalProductConfig,
  ServiceProductConfig,
} from "../../domain/factories/ProductFactory";

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  type: ProductType;
  attributes?: any;
  stock?: number;
}

export interface CreateProductResponse {
  success: boolean;
  product?: Product;
  error?: string;
}

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    try {
      // 1. Validar entrada
      this.validateRequest(request);

      // 2. Preparar configuração baseada no tipo
      const config = this.prepareProductConfig(request);

      // 3. Usar Factory Pattern para criar produto
      const product = ProductFactoryCreator.createProduct(request.type, config);

      // 4. Salvar no repositório
      const savedProduct = await this.productRepository.create(product);

      return {
        success: true,
        product: savedProduct,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }

  private validateRequest(request: CreateProductRequest): void {
    if (!request.name || request.name.trim().length < 2) {
      throw new Error("Product name must have at least 2 characters");
    }

    if (!request.description || request.description.trim().length < 10) {
      throw new Error("Product description must have at least 10 characters");
    }

    if (request.price <= 0) {
      throw new Error("Product price must be greater than 0");
    }

    if (!request.categoryId) {
      throw new Error("Product must have a category");
    }

    if (!Object.values(ProductType).includes(request.type)) {
      throw new Error("Invalid product type");
    }
  }

  private prepareProductConfig(request: CreateProductRequest): ProductConfig {
    const baseConfig: ProductConfig = {
      name: request.name,
      description: request.description,
      price: request.price,
      categoryId: request.categoryId,
      imageUrl: request.imageUrl,
    };

    switch (request.type) {
      case ProductType.PHYSICAL:
        return {
          ...baseConfig,
          stock: request.stock || 0,
          weight: request.attributes?.weight,
          dimensions: request.attributes?.dimensions,
          shippingRequired: request.attributes?.shippingRequired ?? true,
        } as PhysicalProductConfig;

      case ProductType.DIGITAL:
        return {
          ...baseConfig,
          downloadUrl: request.attributes?.downloadUrl,
          fileSize: request.attributes?.fileSize,
          downloadLimit: request.attributes?.downloadLimit,
          accessDuration: request.attributes?.accessDuration,
        } as DigitalProductConfig;

      case ProductType.SERVICE:
        return {
          ...baseConfig,
          duration: request.attributes?.duration,
          deliveryTime: request.attributes?.deliveryTime,
          requiresScheduling: request.attributes?.requiresScheduling ?? true,
          availableSlots: request.attributes?.availableSlots,
        } as ServiceProductConfig;

      default:
        return baseConfig;
    }
  }
}
