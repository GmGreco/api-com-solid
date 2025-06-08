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

// DTOs (Data Transfer Objects)
export interface CreateOrderRequest {
  userId: string;
  items: CreateOrderItemRequest[];
  paymentMethod: PaymentMethod;
  paymentData: any;
  // Dados opcionais para validações avançadas
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

// Use Case seguindo Single Responsibility Principle
export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // 1. Validar entrada básica
      this.validateRequest(request);

      // 2. Verificar se o usuário existe
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      // 3. Validar e preparar itens do pedido
      const orderItems = await this.validateAndPrepareItems(request.items);
      if (!orderItems.success) {
        return {
          success: false,
          error: orderItems.error,
        };
      }

      // 4. Criar instância do pedido
      const orderId = this.generateOrderId();
      const order = new Order(
        orderId,
        request.userId,
        orderItems.items!,
        OrderStatus.PENDING,
        request.paymentMethod,
        PaymentStatus.PENDING
      );

      // ===============================================
      // 🎯 CHAIN OF RESPONSIBILITY PATTERN - Validações
      // ===============================================

      // 5. Executar cadeia de validações usando Chain of Responsibility
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

      // 6. Processar pagamento
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

      // 7. Atualizar status de pagamento
      order.completePayment();

      // 8. Salvar pedido no repositório
      const savedOrder = await this.orderRepository.create(order);

      // 9. Atualizar estoque dos produtos
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

  // ===============================================
  // 🔗 CHAIN OF RESPONSIBILITY - Método de validação
  // ===============================================

  private async validateOrderWithChain(
    order: Order,
    user: any,
    products: any[],
    productTypes: Map<string, ProductType>,
    customerData?: any
  ): Promise<ValidationResult> {
    // Criar contexto para validação
    const validationContext: ValidationContext = {
      order,
      user,
      products,
      productTypes,
      customerData,
    };

    // Construir cadeia de validação completa
    const validationChain = OrderValidationChainBuilder.createCompleteChain();

    // Executar validações
    const result = await validationChain.handle(validationContext);

    // Log warnings se existirem
    if (result.warnings.length > 0) {
      console.log("Order validation warnings:", result.warnings);
    }

    // Log metadata para auditoria
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

    // Buscar todos os produtos de uma vez
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return {
        success: false,
        error: `Products not found: ${missingIds.join(", ")}`,
      };
    }

    // Simular tipos de produtos (em uma implementação real,
    // isso viria de um repositório ou serviço especializado)
    const productTypes = new Map<string, ProductType>();

    // Validar cada item e determinar tipos
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

      // Simular determinação do tipo de produto baseado em heurísticas
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
