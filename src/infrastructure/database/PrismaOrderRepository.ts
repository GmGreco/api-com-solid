import { PrismaClient } from "@prisma/client";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderItem,
} from "../../domain/entities/Order";
import {
  IOrderRepository,
  OrderFilters,
} from "../../domain/repositories/IOrderRepository";
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}
  async create(order: Order): Promise<Order> {
    const orderData = {
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: {
        create: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    };
    const created = await this.prisma.order.create({
      data: orderData,
      include: {
        orderItems: true,
      },
    });
    return this.toDomainEntity(created);
  }
  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });
    return order ? this.toDomainEntity(order) : null;
  }
  async update(order: Order): Promise<Order> {
    const orderData = {
      status: order.status,
      paymentStatus: order.paymentStatus,
      updatedAt: order.updatedAt,
    };
    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: orderData,
      include: {
        orderItems: true,
      },
    });
    return this.toDomainEntity(updated);
  }
  async delete(id: string): Promise<void> {
    await this.prisma.orderItem.deleteMany({
      where: { orderId: id },
    });
    await this.prisma.order.delete({
      where: { id },
    });
  }
  async findByUserId(userId: string, limit = 50, offset = 0): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => this.toDomainEntity(order));
  }
  async findByStatus(
    status: OrderStatus,
    limit = 50,
    offset = 0
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { status },
      include: {
        orderItems: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => this.toDomainEntity(order));
  }
  async findByPaymentStatus(
    paymentStatus: PaymentStatus,
    limit = 50,
    offset = 0
  ): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { paymentStatus },
      include: {
        orderItems: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => this.toDomainEntity(order));
  }
  async findAll(filters?: OrderFilters): Promise<Order[]> {
    const where: any = {};
    if (filters?.userId) {
      where.userId = filters.userId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }
    if (filters?.minTotal || filters?.maxTotal) {
      where.total = {};
      if (filters.minTotal) {
        where.total.gte = filters.minTotal;
      }
      if (filters.maxTotal) {
        where.total.lte = filters.maxTotal;
      }
    }
    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }
    const orders = await this.prisma.order.findMany({
      where,
      include: {
        orderItems: true,
      },
      orderBy,
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
    return orders.map((order) => this.toDomainEntity(order));
  }
  async findPendingOrders(): Promise<Order[]> {
    return this.findByStatus(OrderStatus.PENDING);
  }
  async findOrdersToShip(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.COMPLETED,
      },
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return orders.map((order) => this.toDomainEntity(order));
  }
  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<void> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        updatedAt: new Date(),
      },
    });
  }
  private toDomainEntity(order: any): Order {
    const items: OrderItem[] = order.orderItems.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));
    return new Order(
      order.id,
      order.userId,
      items,
      order.status as OrderStatus,
      order.paymentMethod as PaymentMethod,
      order.paymentStatus as PaymentStatus,
      order.createdAt,
      order.updatedAt
    );
  }
}
