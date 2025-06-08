import { Order } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";

export interface GetOrderByIdRequest {
  id: string;
  userId?: string; // Para verificar se o usuário tem permissão
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
      // 1. Validar entrada
      if (!request.id) {
        return {
          success: false,
          error: "Order ID is required",
        };
      }

      // 2. Buscar pedido
      const order = await this.orderRepository.findById(request.id);

      if (!order) {
        return {
          success: false,
          error: "Order not found",
        };
      }

      // 3. Verificar permissão (se userId fornecido)
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
