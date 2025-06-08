import { Product, ProductStatus } from "../entities/Product";
import { v4 as uuidv4 } from "uuid";

export enum ProductType {
  PHYSICAL = "PHYSICAL",
  DIGITAL = "DIGITAL",
  SERVICE = "SERVICE",
}

export enum ProductCategory {
  ELECTRONICS = "ELECTRONICS",
  BOOKS = "BOOKS",
  CLOTHING = "CLOTHING",
  SOFTWARE = "SOFTWARE",
  COURSES = "COURSES",
  CONSULTING = "CONSULTING",
}

export interface ProductConfig {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
}

export interface PhysicalProductConfig extends ProductConfig {
  stock: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingRequired: boolean;
}

export interface DigitalProductConfig extends ProductConfig {
  downloadUrl?: string;
  fileSize?: number;
  downloadLimit?: number;
  accessDuration?: number; // em dias
}

export interface ServiceProductConfig extends ProductConfig {
  duration?: number; // em horas
  deliveryTime?: number; // em dias
  requiresScheduling: boolean;
  availableSlots?: string[];
}

// Abstract Factory Pattern
export abstract class ProductFactory {
  abstract createProduct(config: ProductConfig): Product;

  // Template Method Pattern - define o fluxo comum de criação
  protected createBaseProduct(config: ProductConfig): Product {
    const id = uuidv4();

    return new Product(
      id,
      config.name,
      config.description,
      config.price,
      0, // stock padrão, será ajustado pelas subclasses
      config.categoryId,
      config.imageUrl,
      ProductStatus.ACTIVE
    );
  }

  // Método para validações comuns
  protected validateBaseConfig(config: ProductConfig): void {
    if (!config.name || config.name.trim().length < 2) {
      throw new Error("Product name must have at least 2 characters");
    }

    if (!config.description || config.description.trim().length < 10) {
      throw new Error("Product description must have at least 10 characters");
    }

    if (config.price <= 0) {
      throw new Error("Product price must be greater than 0");
    }

    if (!config.categoryId) {
      throw new Error("Product must have a category");
    }
  }
}

// Concrete Factory: Produtos Físicos
export class PhysicalProductFactory extends ProductFactory {
  createProduct(config: PhysicalProductConfig): Product {
    this.validateBaseConfig(config);
    this.validatePhysicalConfig(config);

    const product = this.createBaseProduct(config);

    // Configurar estoque para produtos físicos
    product.updateStock(config.stock);

    return product;
  }

  private validatePhysicalConfig(config: PhysicalProductConfig): void {
    if (config.stock < 0) {
      throw new Error("Physical product stock cannot be negative");
    }

    if (config.weight && config.weight <= 0) {
      throw new Error("Product weight must be greater than 0");
    }

    if (config.dimensions) {
      const { length, width, height } = config.dimensions;
      if (length <= 0 || width <= 0 || height <= 0) {
        throw new Error("Product dimensions must be greater than 0");
      }
    }
  }
}

// Concrete Factory: Produtos Digitais
export class DigitalProductFactory extends ProductFactory {
  createProduct(config: DigitalProductConfig): Product {
    this.validateBaseConfig(config);
    this.validateDigitalConfig(config);

    const product = this.createBaseProduct(config);

    // Produtos digitais têm estoque "infinito"
    product.updateStock(999999);

    return product;
  }

  private validateDigitalConfig(config: DigitalProductConfig): void {
    if (config.fileSize && config.fileSize <= 0) {
      throw new Error("File size must be greater than 0");
    }

    if (config.downloadLimit && config.downloadLimit <= 0) {
      throw new Error("Download limit must be greater than 0");
    }

    if (config.accessDuration && config.accessDuration <= 0) {
      throw new Error("Access duration must be greater than 0");
    }
  }
}

// Concrete Factory: Serviços
export class ServiceProductFactory extends ProductFactory {
  createProduct(config: ServiceProductConfig): Product {
    this.validateBaseConfig(config);
    this.validateServiceConfig(config);

    const product = this.createBaseProduct(config);

    // Serviços têm estoque baseado em disponibilidade
    const availableSlots = config.availableSlots?.length || 1;
    product.updateStock(availableSlots);

    return product;
  }

  private validateServiceConfig(config: ServiceProductConfig): void {
    if (config.duration && config.duration <= 0) {
      throw new Error("Service duration must be greater than 0");
    }

    if (config.deliveryTime && config.deliveryTime < 0) {
      throw new Error("Delivery time cannot be negative");
    }

    if (config.availableSlots && config.availableSlots.length === 0) {
      throw new Error("Service must have at least one available slot");
    }
  }
}

// Factory Method Pattern - Factory Creator
export class ProductFactoryCreator {
  private static factories = new Map<ProductType, ProductFactory>([
    [ProductType.PHYSICAL, new PhysicalProductFactory()],
    [ProductType.DIGITAL, new DigitalProductFactory()],
    [ProductType.SERVICE, new ServiceProductFactory()],
  ]);

  static createProduct(type: ProductType, config: ProductConfig): Product {
    const factory = this.factories.get(type);

    if (!factory) {
      throw new Error(`Unsupported product type: ${type}`);
    }

    return factory.createProduct(config);
  }

  static registerFactory(type: ProductType, factory: ProductFactory): void {
    this.factories.set(type, factory);
  }

  static getAvailableTypes(): ProductType[] {
    return Array.from(this.factories.keys());
  }
}

// Builder Pattern para configuração complexa de produtos
export class ProductConfigBuilder {
  private config: Partial<ProductConfig> = {};

  setName(name: string): ProductConfigBuilder {
    this.config.name = name;
    return this;
  }

  setDescription(description: string): ProductConfigBuilder {
    this.config.description = description;
    return this;
  }

  setPrice(price: number): ProductConfigBuilder {
    this.config.price = price;
    return this;
  }

  setCategoryId(categoryId: string): ProductConfigBuilder {
    this.config.categoryId = categoryId;
    return this;
  }

  setImageUrl(imageUrl: string): ProductConfigBuilder {
    this.config.imageUrl = imageUrl;
    return this;
  }

  build(): ProductConfig {
    if (
      !this.config.name ||
      !this.config.description ||
      !this.config.price ||
      !this.config.categoryId
    ) {
      throw new Error("Missing required product configuration");
    }

    return this.config as ProductConfig;
  }
}

// Builder específico para produtos físicos
export class PhysicalProductConfigBuilder extends ProductConfigBuilder {
  private physicalConfig: Partial<PhysicalProductConfig> = {};

  setName(name: string): PhysicalProductConfigBuilder {
    super.setName(name);
    return this;
  }

  setDescription(description: string): PhysicalProductConfigBuilder {
    super.setDescription(description);
    return this;
  }

  setPrice(price: number): PhysicalProductConfigBuilder {
    super.setPrice(price);
    return this;
  }

  setCategoryId(categoryId: string): PhysicalProductConfigBuilder {
    super.setCategoryId(categoryId);
    return this;
  }

  setImageUrl(imageUrl: string): PhysicalProductConfigBuilder {
    super.setImageUrl(imageUrl);
    return this;
  }

  setStock(stock: number): PhysicalProductConfigBuilder {
    this.physicalConfig.stock = stock;
    return this;
  }

  setWeight(weight: number): PhysicalProductConfigBuilder {
    this.physicalConfig.weight = weight;
    return this;
  }

  setDimensions(
    length: number,
    width: number,
    height: number
  ): PhysicalProductConfigBuilder {
    this.physicalConfig.dimensions = { length, width, height };
    return this;
  }

  setShippingRequired(required: boolean): PhysicalProductConfigBuilder {
    this.physicalConfig.shippingRequired = required;
    return this;
  }

  build(): PhysicalProductConfig {
    const baseConfig = super.build();

    if (this.physicalConfig.stock === undefined) {
      throw new Error("Physical product must have stock defined");
    }

    if (this.physicalConfig.shippingRequired === undefined) {
      this.physicalConfig.shippingRequired = true;
    }

    return {
      ...baseConfig,
      ...this.physicalConfig,
    } as PhysicalProductConfig;
  }
}

// Utility class para criação rápida de produtos
export class QuickProductFactory {
  static createBook(
    name: string,
    description: string,
    price: number,
    categoryId: string
  ): Product {
    const config: DigitalProductConfig = {
      name,
      description,
      price,
      categoryId,
      downloadUrl: `/downloads/${name.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      fileSize: Math.floor(Math.random() * 50) + 5, // 5-55 MB
      downloadLimit: 3,
      accessDuration: 365, // 1 ano
    };

    return ProductFactoryCreator.createProduct(ProductType.DIGITAL, config);
  }

  static createClothing(
    name: string,
    description: string,
    price: number,
    categoryId: string,
    stock: number
  ): Product {
    const config: PhysicalProductConfig = {
      name,
      description,
      price,
      categoryId,
      stock,
      weight: Math.random() * 2 + 0.5, // 0.5-2.5 kg
      shippingRequired: true,
    };

    return ProductFactoryCreator.createProduct(ProductType.PHYSICAL, config);
  }

  static createCourse(
    name: string,
    description: string,
    price: number,
    categoryId: string
  ): Product {
    const config: DigitalProductConfig = {
      name,
      description,
      price,
      categoryId,
      accessDuration: 180, // 6 meses
      downloadLimit: undefined, // ilimitado
    };

    return ProductFactoryCreator.createProduct(ProductType.DIGITAL, config);
  }
}
