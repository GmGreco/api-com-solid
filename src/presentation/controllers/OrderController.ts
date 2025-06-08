import { Request, Response } from "express";
import {
  CreateOrderUseCase,
  CreateOrderRequest,
} from "../../application/use-cases/CreateOrderUseCase";
import {
  GetOrderByIdUseCase,
  GetOrderByIdRequest,
} from "../../application/use-cases/GetOrderByIdUseCase";
import {
  GetUserOrdersUseCase,
  GetUserOrdersRequest,
} from "../../application/use-cases/GetUserOrdersUseCase";
import {
  UpdateOrderStatusUseCase,
  UpdateOrderStatusRequest,
} from "../../application/use-cases/UpdateOrderStatusUseCase";
import { PaymentMethod, OrderStatus } from "../../domain/entities/Order";
export class OrderController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private getOrderByIdUseCase: GetOrderByIdUseCase,
    private getUserOrdersUseCase: GetUserOrdersUseCase,
    private updateOrderStatusUseCase: UpdateOrderStatusUseCase
  ) {}
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { userId, items, paymentMethod, paymentData, customerData } =
        req.body;
      if (!userId || !items || !paymentMethod) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: userId, items, paymentMethod",
        });
        return;
      }
      if (!Object.values(PaymentMethod).includes(paymentMethod)) {
        res.status(400).json({
          success: false,
          error: "Invalid payment method",
        });
        return;
      }
      const createOrderRequest: CreateOrderRequest = {
        userId,
        items,
        paymentMethod,
        paymentData: paymentData || {},
        customerData: customerData || {},
      };
      const result = await this.createOrderUseCase.execute(createOrderRequest);
      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            order: result.order?.toJSON(),
            payment: result.paymentResult,
            validation: result.validationResult,
          },
          message: "Order created successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
          validation: result.validationResult,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: "Order ID is required",
        });
        return;
      }
      const getRequest: GetOrderByIdRequest = {
        id,
        userId: req.user?.userId, 
      };
      const result = await this.getOrderByIdUseCase.execute(getRequest);
      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            order: result.order?.toJSON(),
          },
        });
      } else {
        const statusCode =
          result.error === "Order not found"
            ? 404
            : result.error === "Access denied"
            ? 403
            : 400;
        res.status(statusCode).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      if (!userId) {
        res.status(400).json({
          success: false,
          error: "User ID is required",
        });
        return;
      }
      if (req.user && req.user.role !== "ADMIN" && req.user.userId !== userId) {
        res.status(403).json({
          success: false,
          error: "Access denied",
        });
        return;
      }
      const getUserOrdersRequest: GetUserOrdersRequest = {
        userId,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };
      const result = await this.getUserOrdersUseCase.execute(
        getUserOrdersRequest
      );
      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            orders: result.orders?.map((order) => order.toJSON()),
            total: result.total,
            pagination: {
              limit: parseInt(limit as string),
              offset: parseInt(offset as string),
            },
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!id || !status) {
        res.status(400).json({
          success: false,
          error: "Order ID and status are required",
        });
        return;
      }
      if (!Object.values(OrderStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: "Invalid order status",
        });
        return;
      }
      const updateRequest: UpdateOrderStatusRequest = {
        orderId: id,
        status,
        userId: req.user?.userId, 
      };
      const result = await this.updateOrderStatusUseCase.execute(updateRequest);
      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            order: result.order?.toJSON(),
          },
          message: "Order status updated successfully",
        });
      } else {
        const statusCode =
          result.error === "Order not found"
            ? 404
            : result.error === "Access denied"
            ? 403
            : 400;
        res.status(statusCode).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
