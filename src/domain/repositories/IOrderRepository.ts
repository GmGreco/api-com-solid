import { Order, OrderStatus, PaymentStatus } from "../entities/Order";

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  update(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
  findByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<Order[]>;
  findByStatus(
    status: OrderStatus,
    limit?: number,
    offset?: number
  ): Promise<Order[]>;
  findByPaymentStatus(
    paymentStatus: PaymentStatus,
    limit?: number,
    offset?: number
  ): Promise<Order[]>;
  findAll(filters?: OrderFilters): Promise<Order[]>;
  findPendingOrders(): Promise<Order[]>;
  findOrdersToShip(): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<void>;
  updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<void>;
}

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "total" | "status";
  sortOrder?: "asc" | "desc";
}
