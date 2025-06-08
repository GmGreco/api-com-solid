export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}
export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  PIX = "PIX",
  BOLETO = "BOLETO",
}
export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}
export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}
export class Order {
  constructor(
    private _id: string,
    private _userId: string,
    private _items: OrderItem[],
    private _status: OrderStatus = OrderStatus.PENDING,
    private _paymentMethod: PaymentMethod,
    private _paymentStatus: PaymentStatus = PaymentStatus.PENDING,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {
    this.validateOrder();
  }
  private validateOrder(): void {
    if (!this._userId) {
      throw new Error("Order must have a user");
    }
    if (!this._items || this._items.length === 0) {
      throw new Error("Order must have at least one item");
    }
    for (const item of this._items) {
      if (item.quantity <= 0) {
        throw new Error("Item quantity must be greater than 0");
      }
      if (item.price <= 0) {
        throw new Error("Item price must be greater than 0");
      }
    }
  }
  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get items(): OrderItem[] {
    return [...this._items];
  }
  get status(): OrderStatus {
    return this._status;
  }
  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }
  get paymentStatus(): PaymentStatus {
    return this._paymentStatus;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get total(): number {
    return this._items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
  public canBeCancelled(): boolean {
    return (
      this._status === OrderStatus.PENDING ||
      this._status === OrderStatus.CONFIRMED
    );
  }
  public canBeShipped(): boolean {
    return (
      this._status === OrderStatus.PROCESSING &&
      this._paymentStatus === PaymentStatus.COMPLETED
    );
  }
  public canBeDelivered(): boolean {
    return this._status === OrderStatus.SHIPPED;
  }
  public confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Only pending orders can be confirmed");
    }
    this._status = OrderStatus.CONFIRMED;
    this._updatedAt = new Date();
  }
  public startProcessing(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error("Only confirmed orders can start processing");
    }
    this._status = OrderStatus.PROCESSING;
    this._updatedAt = new Date();
  }
  public ship(): void {
    if (!this.canBeShipped()) {
      throw new Error("Order cannot be shipped. Check status and payment.");
    }
    this._status = OrderStatus.SHIPPED;
    this._updatedAt = new Date();
  }
  public deliver(): void {
    if (!this.canBeDelivered()) {
      throw new Error("Only shipped orders can be delivered");
    }
    this._status = OrderStatus.DELIVERED;
    this._updatedAt = new Date();
  }
  public cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error("Order cannot be cancelled at this stage");
    }
    this._status = OrderStatus.CANCELLED;
    this._paymentStatus = PaymentStatus.CANCELLED;
    this._updatedAt = new Date();
  }
  public completePayment(): void {
    if (this._paymentStatus !== PaymentStatus.PENDING) {
      throw new Error("Payment is not pending");
    }
    this._paymentStatus = PaymentStatus.COMPLETED;
    this._updatedAt = new Date();
  }
  public failPayment(): void {
    if (this._paymentStatus !== PaymentStatus.PENDING) {
      throw new Error("Payment is not pending");
    }
    this._paymentStatus = PaymentStatus.FAILED;
    this._updatedAt = new Date();
  }
  public addItem(item: OrderItem): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Cannot modify confirmed orders");
    }
    const existingItem = this._items.find(
      (i) => i.productId === item.productId
    );
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this._items.push(item);
    }
    this._updatedAt = new Date();
  }
  public removeItem(productId: string): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Cannot modify confirmed orders");
    }
    const index = this._items.findIndex((i) => i.productId === productId);
    if (index === -1) {
      throw new Error("Item not found in order");
    }
    this._items.splice(index, 1);
    if (this._items.length === 0) {
      throw new Error("Order must have at least one item");
    }
    this._updatedAt = new Date();
  }
  public updateItemQuantity(productId: string, quantity: number): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Cannot modify confirmed orders");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    const item = this._items.find((i) => i.productId === productId);
    if (!item) {
      throw new Error("Item not found in order");
    }
    item.quantity = quantity;
    this._updatedAt = new Date();
  }
  public toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      items: this._items,
      status: this._status,
      paymentMethod: this._paymentMethod,
      paymentStatus: this._paymentStatus,
      total: this.total,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
