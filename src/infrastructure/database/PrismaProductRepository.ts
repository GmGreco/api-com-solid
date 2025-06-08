import { PrismaClient } from "@prisma/client";
import { Product, ProductStatus } from "../../domain/entities/Product";
import {
  IProductRepository,
  ProductFilters,
} from "../../domain/repositories/IProductRepository";
export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaClient) {}
  async create(product: Product): Promise<Product> {
    const productData = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    const created = await this.prisma.product.create({
      data: productData,
    });
    return this.toDomainEntity(created);
  }
  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    return product ? this.toDomainEntity(product) : null;
  }
  async findByIds(ids: string[]): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    return products.map((product) => this.toDomainEntity(product));
  }
  async update(product: Product): Promise<Product> {
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      status: product.status,
      updatedAt: product.updatedAt,
    };
    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: productData,
    });
    return this.toDomainEntity(updated);
  }
  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const where: any = {};
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        where.price.lte = filters.maxPrice;
      }
    }
    if (filters?.inStock) {
      where.stock = {
        gt: 0,
      };
    }
    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }
    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
    return products.map((product) => this.toDomainEntity(product));
  }
  async findByCategory(
    categoryId: string,
    limit = 50,
    offset = 0
  ): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { categoryId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    return products.map((product) => this.toDomainEntity(product));
  }
  async search(query: string, limit = 50, offset = 0): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
        ],
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    return products.map((product) => this.toDomainEntity(product));
  }
  async findLowStock(threshold: number): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        stock: {
          lte: threshold,
        },
        status: ProductStatus.ACTIVE,
      },
      orderBy: { stock: "asc" },
    });
    return products.map((product) => this.toDomainEntity(product));
  }
  async updateStock(productId: string, quantity: number): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
        updatedAt: new Date(),
      },
    });
  }
  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product || product.stock < quantity) {
        return false;
      }
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
          updatedAt: new Date(),
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  async releaseStock(productId: string, quantity: number): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
        updatedAt: new Date(),
      },
    });
  }
  private toDomainEntity(product: any): Product {
    return new Product(
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock,
      product.categoryId,
      product.imageUrl,
      product.status as ProductStatus,
      product.createdAt,
      product.updatedAt
    );
  }
}
