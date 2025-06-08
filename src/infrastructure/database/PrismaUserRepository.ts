import { PrismaClient } from "@prisma/client";
import { User, UserRole } from "../../domain/entities/User";
import {
  IUserRepository,
  UserFilters,
} from "../../domain/repositories/IUserRepository";

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const userData = {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const created = await this.prisma.user.create({
      data: userData,
    });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async update(user: User): Promise<User> {
    const userData = {
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
      updatedAt: user.updatedAt,
    };

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: userData,
    });

    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findAll(limit = 50, offset = 0): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => this.toDomainEntity(user));
  }

  private toDomainEntity(user: any): User {
    return new User(
      user.id,
      user.email,
      user.password,
      user.name,
      user.role as UserRole,
      user.createdAt,
      user.updatedAt
    );
  }
}
