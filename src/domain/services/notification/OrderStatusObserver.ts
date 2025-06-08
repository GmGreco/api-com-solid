import { Order, OrderStatus } from "../../entities/Order";

// Interface Observer - Define o contrato para observadores
export interface OrderStatusObserver {
  update(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus
  ): void;
}

// Interface Subject - Define o contrato para o sujeito observável
export interface OrderStatusSubject {
  addObserver(observer: OrderStatusObserver): void;
  removeObserver(observer: OrderStatusObserver): void;
  notifyObservers(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus
  ): void;
}

// Concrete Observer: Notificação por Email
export class EmailNotificationObserver implements OrderStatusObserver {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  update(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const messages = this.getStatusMessages(previousStatus, newStatus);

    if (messages.customerMessage && messages.customerSubject) {
      this.emailService.sendEmail(
        order.userId,
        messages.customerSubject,
        messages.customerMessage,
        order
      );
    }

    if (messages.adminMessage && messages.adminSubject) {
      this.emailService.sendAdminEmail(
        messages.adminSubject,
        messages.adminMessage,
        order
      );
    }
  }

  private getStatusMessages(
    previousStatus: OrderStatus,
    newStatus: OrderStatus
  ) {
    const messages: {
      customerSubject?: string;
      customerMessage?: string;
      adminSubject?: string;
      adminMessage?: string;
    } = {};

    switch (newStatus) {
      case OrderStatus.CONFIRMED:
        messages.customerSubject = "Pedido Confirmado!";
        messages.customerMessage =
          "Seu pedido foi confirmado e está sendo preparado.";
        messages.adminSubject = "Novo Pedido Confirmado";
        messages.adminMessage =
          "Um novo pedido foi confirmado e precisa ser processado.";
        break;

      case OrderStatus.PROCESSING:
        messages.customerSubject = "Pedido em Processamento";
        messages.customerMessage =
          "Seu pedido está sendo processado e logo será enviado.";
        break;

      case OrderStatus.SHIPPED:
        messages.customerSubject = "Pedido Enviado!";
        messages.customerMessage = "Seu pedido foi enviado e está a caminho.";
        break;

      case OrderStatus.DELIVERED:
        messages.customerSubject = "Pedido Entregue!";
        messages.customerMessage =
          "Seu pedido foi entregue com sucesso. Obrigado pela preferência!";
        break;

      case OrderStatus.CANCELLED:
        messages.customerSubject = "Pedido Cancelado";
        messages.customerMessage =
          "Seu pedido foi cancelado. Se você não solicitou o cancelamento, entre em contato conosco.";
        messages.adminSubject = "Pedido Cancelado";
        messages.adminMessage = "Um pedido foi cancelado.";
        break;
    }

    return messages;
  }
}

// Concrete Observer: Notificação por SMS
export class SmsNotificationObserver implements OrderStatusObserver {
  private smsService: SmsService;

  constructor(smsService: SmsService) {
    this.smsService = smsService;
  }

  update(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const message = this.getStatusMessage(newStatus);

    if (message) {
      this.smsService.sendSms(order.userId, message);
    }
  }

  private getStatusMessage(status: OrderStatus): string | null {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return "Seu pedido foi confirmado!";
      case OrderStatus.SHIPPED:
        return "Seu pedido foi enviado e está a caminho!";
      case OrderStatus.DELIVERED:
        return "Seu pedido foi entregue!";
      case OrderStatus.CANCELLED:
        return "Seu pedido foi cancelado.";
      default:
        return null;
    }
  }
}

// Concrete Observer: Log de Auditoria
export class AuditLogObserver implements OrderStatusObserver {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  update(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    const logMessage = `Order ${
      order.id
    } status changed from ${previousStatus} to ${newStatus} at ${new Date().toISOString()}`;

    this.logger.info("ORDER_STATUS_CHANGE", {
      orderId: order.id,
      userId: order.userId,
      previousStatus,
      newStatus,
      timestamp: new Date().toISOString(),
      total: order.total,
    });

    // Log crítico para cancelamentos
    if (newStatus === OrderStatus.CANCELLED) {
      this.logger.warn("ORDER_CANCELLED", {
        orderId: order.id,
        userId: order.userId,
        total: order.total,
        reason: "Status changed to cancelled",
      });
    }
  }
}

// Concrete Observer: Atualização de Inventário
export class InventoryObserver implements OrderStatusObserver {
  private inventoryService: InventoryService;

  constructor(inventoryService: InventoryService) {
    this.inventoryService = inventoryService;
  }

  update(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    // Quando o pedido é confirmado, reserva o estoque
    if (
      newStatus === OrderStatus.CONFIRMED &&
      previousStatus === OrderStatus.PENDING
    ) {
      for (const item of order.items) {
        this.inventoryService.reserveStock(item.productId, item.quantity);
      }
    }

    // Quando o pedido é cancelado, libera o estoque
    if (newStatus === OrderStatus.CANCELLED) {
      for (const item of order.items) {
        this.inventoryService.releaseStock(item.productId, item.quantity);
      }
    }

    // Quando o pedido é entregue, confirma o consumo do estoque
    if (newStatus === OrderStatus.DELIVERED) {
      for (const item of order.items) {
        this.inventoryService.confirmStockConsumption(
          item.productId,
          item.quantity
        );
      }
    }
  }
}

// Concrete Subject: Gerenciador de Status de Pedidos
export class OrderStatusManager implements OrderStatusSubject {
  private observers: OrderStatusObserver[] = [];
  private logger?: Logger;

  constructor(logger?: Logger) {
    this.logger = logger;
  }

  addObserver(observer: OrderStatusObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  removeObserver(observer: OrderStatusObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus
  ): void {
    for (const observer of this.observers) {
      try {
        observer.update(order, previousStatus, newStatus);
      } catch (error) {
        // Log error but don't stop other observers
        if (this.logger) {
          this.logger.error("OBSERVER_ERROR", { error: error });
        }
      }
    }
  }

  // Método para mudar status e notificar observadores
  changeOrderStatus(order: Order, newStatus: OrderStatus): void {
    const previousStatus = order.status;

    if (previousStatus === newStatus) {
      return; // Não há mudança de status
    }

    // Aqui seria feita a mudança no banco de dados
    // order.changeStatus(newStatus); // Método que seria implementado na entidade Order

    // Notificar todos os observadores
    this.notifyObservers(order, previousStatus, newStatus);
  }
}

// Serviços auxiliares (interfaces)
export interface EmailService {
  sendEmail(
    userId: string,
    subject: string,
    message: string,
    order: Order
  ): Promise<void>;
  sendAdminEmail(subject: string, message: string, order: Order): Promise<void>;
}

export interface SmsService {
  sendSms(userId: string, message: string): Promise<void>;
}

export interface Logger {
  info(event: string, data: any): void;
  warn(event: string, data: any): void;
  error(event: string, data: any): void;
}

export interface InventoryService {
  reserveStock(productId: string, quantity: number): Promise<void>;
  releaseStock(productId: string, quantity: number): Promise<void>;
  confirmStockConsumption(productId: string, quantity: number): Promise<void>;
}
