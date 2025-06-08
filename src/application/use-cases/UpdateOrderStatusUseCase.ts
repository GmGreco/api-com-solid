import { Order, OrderStatus } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  userId?: string; 
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
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        return {
          success: false,
          error: "Order not found",
        };
      }
      if (userId && order.userId !== userId) {
        return {
          success: false,
          error: "Access denied",
        };
      }
      const previousStatus = order.status;
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
      const updatedOrder = await this.orderRepository.update(order);
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
