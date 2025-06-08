import { Order } from "../../entities/Order";
import { Product } from "../../entities/Product";
import { User } from "../../entities/User";
import { ProductType } from "../../factories/ProductFactory";
export interface ProductWithType extends Product {
  productType: ProductType;
}
export interface ValidationContext {
  order: Order;
  user: User;
  products: Product[];
  productTypes?: Map<string, ProductType>;
  customerData?: {
    creditLimit?: number;
    deliveryRegion?: string;
    isVip?: boolean;
  };
}
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: Record<string, any>;
}
export abstract class OrderValidationHandler {
  protected nextHandler?: OrderValidationHandler;
  public setNext(handler: OrderValidationHandler): OrderValidationHandler {
    this.nextHandler = handler;
    return handler;
  }
  public async handle(context: ValidationContext): Promise<ValidationResult> {
    const result = await this.validate(context);
    if (this.nextHandler && result.isValid) {
      const nextResult = await this.nextHandler.handle(context);
      return this.mergeResults(result, nextResult);
    }
    return result;
  }
  protected abstract validate(
    context: ValidationContext
  ): Promise<ValidationResult>;
  private mergeResults(
    current: ValidationResult,
    next: ValidationResult
  ): ValidationResult {
    return {
      isValid: current.isValid && next.isValid,
      errors: [...current.errors, ...next.errors],
      warnings: [...current.warnings, ...next.warnings],
      metadata: { ...current.metadata, ...next.metadata },
    };
  }
}
export class StockValidationHandler extends OrderValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stockInfo: Record<string, any> = {};
    for (const item of context.order.items) {
      const product = context.products.find((p) => p.id === item.productId);
      if (!product) {
        errors.push(`Produto ${item.productId} não encontrado`);
        continue;
      }
      const productType =
        context.productTypes?.get(product.id) || ProductType.PHYSICAL;
      stockInfo[product.id] = {
        available: product.stock,
        requested: item.quantity,
        type: productType,
      };
      if (productType === ProductType.PHYSICAL) {
        if (product.stock < item.quantity) {
          errors.push(
            `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`
          );
        } else if (product.stock < item.quantity * 2) {
          warnings.push(`Estoque baixo para ${product.name}`);
        }
      }
      if (
        productType === ProductType.DIGITAL &&
        product.stock < item.quantity
      ) {
        errors.push(`Produto digital ${product.name} não disponível`);
      }
      if (
        productType === ProductType.SERVICE &&
        product.stock < item.quantity
      ) {
        errors.push(
          `Serviço ${product.name} não tem horários disponíveis suficientes`
        );
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: { stockValidation: stockInfo },
    };
  }
}
export class PaymentValidationHandler extends OrderValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validPaymentMethods = ["PIX", "CREDIT_CARD", "BOLETO"];
    if (!validPaymentMethods.includes(context.order.paymentMethod)) {
      errors.push(
        `Método de pagamento inválido: ${context.order.paymentMethod}`
      );
    }
    const minimumOrderValue = 10.0;
    if (context.order.total < minimumOrderValue) {
      errors.push(
        `Valor mínimo do pedido é R$ ${minimumOrderValue.toFixed(2)}`
      );
    }
    if (
      context.order.paymentMethod === "CREDIT_CARD" &&
      context.order.total > 5000
    ) {
      warnings.push(
        "Pedido de alto valor - pode requerer verificação adicional"
      );
    }
    if (
      context.order.paymentMethod === "BOLETO" &&
      context.order.total > 1000
    ) {
      warnings.push(
        "Boletos acima de R$ 1.000 têm prazo de vencimento de 1 dia"
      );
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        paymentValidation: {
          method: context.order.paymentMethod,
          amount: context.order.total,
          minimumOrderValue,
        },
      },
    };
  }
}
export class CustomerValidationHandler extends OrderValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!context.user.email.includes("@")) {
      errors.push("Email do usuário inválido");
    }
    if (!context.user.name || context.user.name.length < 2) {
      errors.push("Nome do usuário deve ter pelo menos 2 caracteres");
    }
    const customerData = context.customerData;
    if (customerData) {
      if (
        context.order.paymentMethod === "CREDIT_CARD" &&
        customerData.creditLimit
      ) {
        if (context.order.total > customerData.creditLimit) {
          errors.push(
            `Valor do pedido excede limite de crédito: R$ ${customerData.creditLimit.toFixed(
              2
            )}`
          );
        }
      }
      if (
        customerData.deliveryRegion &&
        !this.isValidDeliveryRegion(customerData.deliveryRegion)
      ) {
        errors.push(
          `Região de entrega não atendida: ${customerData.deliveryRegion}`
        );
      }
      if (customerData.isVip) {
        warnings.push(
          "Cliente VIP - aplicar desconto ou frete grátis se aplicável"
        );
      }
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        customerValidation: {
          userId: context.user.id,
          email: context.user.email,
          isVip: customerData?.isVip || false,
        },
      },
    };
  }
  private isValidDeliveryRegion(region: string): boolean {
    const validRegions = ["SP", "RJ", "MG", "RS", "PR", "SC"];
    return validRegions.includes(region);
  }
}
export class BusinessRulesValidationHandler extends OrderValidationHandler {
  protected async validate(
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (context.order.items.length > 10) {
      errors.push("Máximo de 10 itens por pedido");
    }
    const productIds = context.order.items.map((item) => item.productId);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
      errors.push("Não é permitido adicionar o mesmo produto múltiplas vezes");
    }
    if (context.productTypes) {
      const productTypesInOrder = new Set<ProductType>();
      for (const item of context.order.items) {
        const productType = context.productTypes.get(item.productId);
        if (productType) {
          productTypesInOrder.add(productType);
        }
      }
      const hasPhysical = productTypesInOrder.has(ProductType.PHYSICAL);
      const hasDigital = productTypesInOrder.has(ProductType.DIGITAL);
      const hasService = productTypesInOrder.has(ProductType.SERVICE);
      if (hasPhysical && hasDigital) {
        warnings.push(
          "Mistura de produtos físicos e digitais - considerar envios separados"
        );
      }
      if (hasService && (hasPhysical || hasDigital)) {
        warnings.push(
          "Pedido contém serviços e produtos - verificar agendamentos"
        );
      }
    }
    const now = new Date();
    const isBusinessHours = now.getHours() >= 9 && now.getHours() <= 18;
    if (context.order.total > 1000 && !isBusinessHours) {
      warnings.push(
        "Pedido de alto valor fora do horário comercial - pode ter processamento atrasado"
      );
    }
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        businessRulesValidation: {
          itemCount: context.order.items.length,
          productTypesInOrder: context.productTypes
            ? Array.from(
                new Set(
                  context.order.items.map((item) =>
                    context.productTypes!.get(item.productId)
                  )
                )
              )
            : [],
          isBusinessHours,
        },
      },
    };
  }
}
export class OrderValidationChainBuilder {
  private firstHandler?: OrderValidationHandler;
  private currentHandler?: OrderValidationHandler;
  public addStockValidation(): OrderValidationChainBuilder {
    return this.addHandler(new StockValidationHandler());
  }
  public addPaymentValidation(): OrderValidationChainBuilder {
    return this.addHandler(new PaymentValidationHandler());
  }
  public addCustomerValidation(): OrderValidationChainBuilder {
    return this.addHandler(new CustomerValidationHandler());
  }
  public addBusinessRulesValidation(): OrderValidationChainBuilder {
    return this.addHandler(new BusinessRulesValidationHandler());
  }
  public addCustomHandler(
    handler: OrderValidationHandler
  ): OrderValidationChainBuilder {
    return this.addHandler(handler);
  }
  private addHandler(
    handler: OrderValidationHandler
  ): OrderValidationChainBuilder {
    if (!this.firstHandler) {
      this.firstHandler = handler;
      this.currentHandler = handler;
    } else {
      this.currentHandler!.setNext(handler);
      this.currentHandler = handler;
    }
    return this;
  }
  public build(): OrderValidationHandler {
    if (!this.firstHandler) {
      throw new Error("Nenhum handler foi adicionado à cadeia de validação");
    }
    return this.firstHandler;
  }
  public static createDefaultChain(): OrderValidationHandler {
    return new OrderValidationChainBuilder()
      .addStockValidation()
      .addPaymentValidation()
      .addCustomerValidation()
      .addBusinessRulesValidation()
      .build();
  }
  public static createBasicChain(): OrderValidationHandler {
    return new OrderValidationChainBuilder()
      .addPaymentValidation()
      .addCustomerValidation()
      .build();
  }
  public static createCompleteChain(): OrderValidationHandler {
    return new OrderValidationChainBuilder()
      .addStockValidation()
      .addPaymentValidation()
      .addCustomerValidation()
      .addBusinessRulesValidation()
      .build();
  }
}
