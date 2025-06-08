import {
  Order,
  OrderItem,
  PaymentMethod,
  OrderStatus,
  PaymentStatus,
} from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import {
  PaymentProcessor,
  PaymentStrategyFactory,
} from "../../domain/services/payment/PaymentStrategy";
import {
  OrderValidationChainBuilder,
  ValidationContext,
  ValidationResult,
} from "../../domain/services/validation/OrderValidationChain";
import { ProductType } from "../../domain/factories/ProductFactory";
export interface CreateOrderRequest {
  userId: string;
  items: CreateOrderItemRequest[];
  paymentMethod: PaymentMethod;
  paymentData: any;
  customerData?: {
    creditLimit?: number;
    deliveryRegion?: string;
    isVip?: boolean;
  };
}
export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}
export interface CreateOrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
  paymentResult?: {
    transactionId?: string;
    processingTime?: number;
  };
  validationResult?: ValidationResult;
}
export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository,
    private userRepository: IUserRepository
  ) {}
  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      this.validateRequest(request);
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }
      const orderItems = await this.validateAndPrepareItems(request.items);
      if (!orderItems.success) {
        return {
          success: false,
          error: orderItems.error,
        };
      }
      const orderId = this.generateOrderId();
      const order = new Order(
        orderId,
        request.userId,
        orderItems.items!,
        OrderStatus.PENDING,
        request.paymentMethod,
        PaymentStatus.PENDING
      );
      const validationResult = await this.validateOrderWithChain(
        order,
        user,
        orderItems.products!,
        orderItems.productTypes!,
        request.customerData
      );
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.errors.join("; "),
          validationResult,
        };
      }
      const paymentResult = await this.processPayment(
        order,
        request.paymentData
      );
      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.errorMessage || "Payment failed",
        };
      }
      order.completePayment();
      const savedOrder = await this.orderRepository.create(order);
      await this.updateProductStock(orderItems.items!);
      return {
        success: true,
        order: savedOrder,
        paymentResult: {
          transactionId: paymentResult.transactionId,
          processingTime: paymentResult.processingTime,
        },
        validationResult,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }
  private async validateOrderWithChain(
    order: Order,
    user: any,
    products: any[],
    productTypes: Map<string, ProductType>,
    customerData?: any
  ): Promise<ValidationResult> {
    const validationContext: ValidationContext = {
      order,
      user,
      products,
      productTypes,
      customerData,
    };
    const validationChain = OrderValidationChainBuilder.createCompleteChain();
    const result = await validationChain.handle(validationContext);
    if (result.warnings.length > 0) {
      console.log("Order validation warnings:", result.warnings);
    }
    if (result.metadata) {
      console.log(
        "Order validation metadata:",
        JSON.stringify(result.metadata, null, 2)
      );
    }
    return result;
  }
  private validateRequest(request: CreateOrderRequest): void {
    if (!request.userId) {
      throw new Error("User ID is required");
    }
    if (!request.items || request.items.length === 0) {
      throw new Error("Order must have at least one item");
    }
    if (!request.paymentMethod) {
      throw new Error("Payment method is required");
    }
    for (const item of request.items) {
      if (!item.productId) {
        throw new Error("Product ID is required for all items");
      }
      if (item.quantity <= 0) {
        throw new Error("Item quantity must be greater than 0");
      }
    }
  }
  private async validateAndPrepareItems(
    items: CreateOrderItemRequest[]
  ): Promise<{
    success: boolean;
    items?: OrderItem[];
    products?: any[];
    productTypes?: Map<string, ProductType>;
    error?: string;
  }> {
    const orderItems: OrderItem[] = [];
    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);
    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return {
        success: false,
        error: `Products not found: ${missingIds.join(", ")}`,
      };
    }
    const productTypes = new Map<string, ProductType>();
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return {
          success: false,
          error: `Product not found: ${item.productId}`,
        };
      }
      if (!product.isAvailable()) {
        return {
          success: false,
          error: `Product not available: ${product.name}`,
        };
      }
      let productType: ProductType;
      if (
        product.name.toLowerCase().includes("curso") ||
        product.name.toLowerCase().includes("ebook") ||
        product.name.toLowerCase().includes("digital")
      ) {
        productType = ProductType.DIGITAL;
      } else if (
        product.name.toLowerCase().includes("consultoria") ||
        product.name.toLowerCase().includes("serviço") ||
        product.name.toLowerCase().includes("aula")
      ) {
        productType = ProductType.SERVICE;
      } else {
        productType = ProductType.PHYSICAL;
      }
      productTypes.set(product.id, productType);
      const orderItem: OrderItem = {
        id: this.generateItemId(),
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
      orderItems.push(orderItem);
    }
    return {
      success: true,
      items: orderItems,
      products: products,
      productTypes: productTypes,
    };
  }
  private async processPayment(
    order: Order,
    paymentData: any
  ): Promise<{
    success: boolean;
    transactionId?: string;
    processingTime?: number;
    errorMessage?: string;
  }> {
    try {
      const paymentStrategy = PaymentStrategyFactory.createStrategy(
        order.paymentMethod
      );
      const paymentProcessor = new PaymentProcessor(paymentStrategy);
      const result = await paymentProcessor.processPayment(
        order.total,
        paymentData
      );
      return {
        success: result.success,
        transactionId: result.transactionId,
        processingTime: result.processingTime,
        errorMessage: result.errorMessage,
      };
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
  }
  private async updateProductStock(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        product.decreaseStock(item.quantity);
        await this.productRepository.update(product);
      }
    }
  }
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  private generateItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
