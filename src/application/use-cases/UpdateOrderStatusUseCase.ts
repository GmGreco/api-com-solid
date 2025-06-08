import { Order, OrderStatus } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  userId?: string; // Para verificação de permissão
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(
    request: UpdateOrderStatusRequest
  ): Promise<UpdateOrderStatusResponse> {
    try {
      const { orderId, status, userId } = request;

      // Buscar pedido
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        return {
          success: false,
          error: "Order not found",
        };
      }

      // Verificar permissão (se não for admin, só pode atualizar próprios pedidos)
      if (userId && order.userId !== userId) {
        return {
          success: false,
          error: "Access denied",
        };
      }

      // Guardar status anterior para log
      const previousStatus = order.status;

      // Validar se a transição de status é válida e aplicar
      try {
        switch (status) {
          case OrderStatus.CONFIRMED:
            order.confirm();
            break;
          case OrderStatus.PROCESSING:
            order.startProcessing();
            break;
          case OrderStatus.SHIPPED:
            order.ship();
            break;
          case OrderStatus.DELIVERED:
            order.deliver();
            break;
          case OrderStatus.CANCELLED:
            order.cancel();
            break;
          default:
            return {
              success: false,
              error: `Invalid status transition from ${previousStatus} to ${status}`,
            };
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Salvar pedido atualizado
      const updatedOrder = await this.orderRepository.update(order);

      // Log da alteração
      console.log(
        `Order ${orderId} status changed from ${previousStatus} to ${status}`
      );

      return {
        success: true,
        order: updatedOrder,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
