import { Order } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
export interface GetOrderByIdRequest {
  id: string;
  userId?: string; 
}
export interface GetOrderByIdResponse {
  success: boolean;
  order?: Order;
  error?: string;
}
export class GetOrderByIdUseCase {
  constructor(private orderRepository: IOrderRepository) {}
  async execute(request: GetOrderByIdRequest): Promise<GetOrderByIdResponse> {
    try {
      if (!request.id) {
        return {
          success: false,
          error: "Order ID is required",
        };
      }
      const order = await this.orderRepository.findById(request.id);
      if (!order) {
        return {
          success: false,
          error: "Order not found",
        };
      }
      if (request.userId && order.userId !== request.userId) {
        return {
          success: false,
          error: "Access denied",
        };
      }
      return {
        success: true,
        order,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }
}
