export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}
export class Product {
  constructor(
    private _id: string,
    private _name: string,
    private _description: string,
    private _price: number,
    private _stock: number,
    private _categoryId: string,
    private _imageUrl?: string,
    private _status: ProductStatus = ProductStatus.ACTIVE,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {
    this.validateProduct();
  }
  private validateProduct(): void {
    if (!this._name || this._name.trim().length < 2) {
      throw new Error("Product name must have at least 2 characters");
    }
    if (!this._description || this._description.trim().length < 10) {
      throw new Error("Product description must have at least 10 characters");
    }
    if (this._price <= 0) {
      throw new Error("Product price must be greater than 0");
    }
    if (this._stock < 0) {
      throw new Error("Product stock cannot be negative");
    }
    if (!this._categoryId) {
      throw new Error("Product must have a category");
    }
  }
  get id(): string {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get description(): string {
    return this._description;
  }
  get price(): number {
    return this._price;
  }
  get stock(): number {
    return this._stock;
  }
  get categoryId(): string {
    return this._categoryId;
  }
  get imageUrl(): string | undefined {
    return this._imageUrl;
  }
  get status(): ProductStatus {
    return this._status;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  public isAvailable(): boolean {
    return this._status === ProductStatus.ACTIVE && this._stock > 0;
  }
  public isOutOfStock(): boolean {
    return this._stock === 0;
  }
  public updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new Error("Product price must be greater than 0");
    }
    this._price = newPrice;
    this._updatedAt = new Date();
  }
  public updateStock(newStock: number): void {
    if (newStock < 0) {
      throw new Error("Product stock cannot be negative");
    }
    this._stock = newStock;
    if (newStock === 0 && this._status === ProductStatus.ACTIVE) {
      this._status = ProductStatus.OUT_OF_STOCK;
    } else if (newStock > 0 && this._status === ProductStatus.OUT_OF_STOCK) {
      this._status = ProductStatus.ACTIVE;
    }
    this._updatedAt = new Date();
  }
  public decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    if (quantity > this._stock) {
      throw new Error("Insufficient stock");
    }
    this.updateStock(this._stock - quantity);
  }
  public increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    this.updateStock(this._stock + quantity);
  }
  public activate(): void {
    if (this._stock > 0) {
      this._status = ProductStatus.ACTIVE;
    } else {
      this._status = ProductStatus.OUT_OF_STOCK;
    }
    this._updatedAt = new Date();
  }
  public deactivate(): void {
    this._status = ProductStatus.INACTIVE;
    this._updatedAt = new Date();
  }
  public updateInfo(
    name: string,
    description: string,
    imageUrl?: string
  ): void {
    if (!name || name.trim().length < 2) {
      throw new Error("Product name must have at least 2 characters");
    }
    if (!description || description.trim().length < 10) {
      throw new Error("Product description must have at least 10 characters");
    }
    this._name = name;
    this._description = description;
    this._imageUrl = imageUrl;
    this._updatedAt = new Date();
  }
  public toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      stock: this._stock,
      categoryId: this._categoryId,
      imageUrl: this._imageUrl,
      status: this._status,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
