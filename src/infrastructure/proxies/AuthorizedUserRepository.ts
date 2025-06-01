import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";

export interface AuthContext {
  userId: string;
  role: "admin" | "user";
  permissions: string[];
}

export class AuthorizedUserRepository implements UserRepository {
  constructor(
    private repository: UserRepository,
    private authContext: AuthContext
  ) {}

  async findAll(): Promise<User[]> {
    this.checkPermission("users:read");

    if (this.authContext.role === "admin") {
      return await this.repository.findAll();
    }

    // Usuários comuns só podem ver a si mesmos
    const user = await this.repository.findById(this.authContext.userId);
    return user ? [user] : [];
  }

  async findById(id: string): Promise<User | null> {
    this.checkPermission("users:read");

    // Usuários só podem acessar seus próprios dados, admins podem acessar qualquer um
    if (this.authContext.role !== "admin" && id !== this.authContext.userId) {
      throw new Error("Access denied: You can only access your own data");
    }

    return await this.repository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    this.checkPermission("users:read");

    const user = await this.repository.findByEmail(email);

    // Verificar se o usuário pode acessar este email
    if (
      user &&
      this.authContext.role !== "admin" &&
      user.id !== this.authContext.userId
    ) {
      throw new Error("Access denied: You can only access your own data");
    }

    return user;
  }

  async create(user: User): Promise<User> {
    this.checkPermission("users:create");

    // Apenas admins podem criar usuários
    if (this.authContext.role !== "admin") {
      throw new Error("Access denied: Only administrators can create users");
    }

    console.log(
      `Admin ${this.authContext.userId} creating user: ${user.email}`
    );
    return await this.repository.create(user);
  }

  async update(user: User): Promise<User> {
    this.checkPermission("users:update");

    // Usuários só podem atualizar seus próprios dados
    if (
      this.authContext.role !== "admin" &&
      user.id !== this.authContext.userId
    ) {
      throw new Error("Access denied: You can only update your own data");
    }

    console.log(`User ${this.authContext.userId} updating user: ${user.id}`);
    return await this.repository.update(user);
  }

  async delete(id: string): Promise<void> {
    this.checkPermission("users:delete");

    // Apenas admins podem deletar usuários
    if (this.authContext.role !== "admin") {
      throw new Error("Access denied: Only administrators can delete users");
    }

    // Admins não podem deletar a si mesmos
    if (id === this.authContext.userId) {
      throw new Error("Access denied: You cannot delete your own account");
    }

    console.log(`Admin ${this.authContext.userId} deleting user: ${id}`);
    await this.repository.delete(id);
  }

  private checkPermission(permission: string): void {
    if (!this.authContext.permissions.includes(permission)) {
      throw new Error(`Access denied: Missing permission ${permission}`);
    }
  }
}
