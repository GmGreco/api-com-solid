import { Order } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";

export interface GetUserOrdersRequest {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface GetUserOrdersResponse {
  success: boolean;
  orders?: Order[];
  total?: number;
  error?: string;
}

export class GetUserOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: GetUserOrdersRequest): Promise<GetUserOrdersResponse> {
    try {
      // 1. Validar entrada
      if (!request.userId) {
        return {
          success: false,
          error: "User ID is required",
        };
      }

      // 2. Buscar pedidos do usuário
      const orders = await this.orderRepository.findByUserId(
        request.userId,
        request.limit || 50,
        request.offset || 0
      );

      return {
        success: true,
        orders,
        total: orders.length,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }
}
