import { Request, Response } from "express";
import {
  CreateProductUseCase,
  CreateProductRequest,
} from "../../application/use-cases/CreateProductUseCase";
import {
  GetProductsUseCase,
  GetProductsRequest,
} from "../../application/use-cases/GetProductsUseCase";
import {
  GetProductByIdUseCase,
  GetProductByIdRequest,
} from "../../application/use-cases/GetProductByIdUseCase";
import { ProductType } from "../../domain/factories/ProductFactory";
export class ProductController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private getProductsUseCase: GetProductsUseCase,
    private getProductByIdUseCase: GetProductByIdUseCase
  ) {}
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        description,
        price,
        categoryId,
        imageUrl,
        type,
        attributes,
        stock,
      } = req.body;
      if (!name || !description || !price || !categoryId || !type) {
        res.status(400).json({
          success: false,
          error:
            "Missing required fields: name, description, price, categoryId, type",
        });
        return;
      }
      const createRequest: CreateProductRequest = {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        imageUrl,
        type,
        attributes,
        stock: stock ? parseInt(stock) : undefined,
      };
      const result = await this.createProductUseCase.execute(createRequest);
      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            product: result.product?.toJSON(),
          },
          message: "Product created successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        limit,
        offset,
        categoryId,
        status,
        minPrice,
        maxPrice,
        inStock,
        sortBy,
        sortOrder,
      } = req.query;
      const getRequest: GetProductsRequest = {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        categoryId: categoryId as string,
        status: status as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        inStock: inStock === "true",
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      };
      const result = await this.getProductsUseCase.execute(getRequest);
      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            products: result.products?.map((p) => p.toJSON()),
            total: result.total,
            pagination: {
              limit: getRequest.limit || 50,
              offset: getRequest.offset || 0,
            },
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: "Product ID is required",
        });
        return;
      }
      const getRequest: GetProductByIdRequest = { id };
      const result = await this.getProductByIdUseCase.execute(getRequest);
      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            product: result.product?.toJSON(),
          },
        });
      } else {
        const statusCode = result.error === "Product not found" ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({
        success: false,
        error: "Update product not implemented yet",
        message: "This endpoint will be implemented in the next iteration",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit, offset } = req.query;
      if (!q) {
        res.status(400).json({
          success: false,
          error: "Search query is required",
        });
        return;
      }
      const getRequest: GetProductsRequest = {
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
      };
      const result = await this.getProductsUseCase.execute(getRequest);
      if (result.success) {
        const searchTerm = (q as string).toLowerCase();
        const filteredProducts = result.products?.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        res.status(200).json({
          success: true,
          data: {
            products: filteredProducts?.map((p) => p.toJSON()),
            total: filteredProducts?.length || 0,
            searchTerm: q,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
