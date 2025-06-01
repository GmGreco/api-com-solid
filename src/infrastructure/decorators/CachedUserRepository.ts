import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class CachedUserRepository implements UserRepository {
  private cache = new Map<string, User | User[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(private repository: UserRepository) {}

  async findAll(): Promise<User[]> {
    const cacheKey = "all_users";
    const cached = this.getFromCache(cacheKey);

    if (cached && Array.isArray(cached)) {
      console.log("Cache hit for all users");
      return cached;
    }

    const users = await this.repository.findAll();
    this.setCache(cacheKey, users);
    console.log("Cache miss for all users - data cached");

    return users;
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user_${id}`;
    const cached = this.getFromCache(cacheKey);

    if (cached && !Array.isArray(cached)) {
      console.log(`Cache hit for user ${id}`);
      return cached;
    }

    const user = await this.repository.findById(id);
    if (user) {
      this.setCache(cacheKey, user);
      console.log(`Cache miss for user ${id} - data cached`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user_email_${email}`;
    const cached = this.getFromCache(cacheKey);

    if (cached && !Array.isArray(cached)) {
      console.log(`Cache hit for user email ${email}`);
      return cached;
    }

    const user = await this.repository.findByEmail(email);
    if (user) {
      this.setCache(cacheKey, user);
      console.log(`Cache miss for user email ${email} - data cached`);
    }

    return user;
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.repository.create(user);

    // Invalidar cache relacionado
    this.invalidateCache("all_users");

    // Cachear o novo usuário
    if (createdUser.id) {
      this.setCache(`user_${createdUser.id}`, createdUser);
      this.setCache(`user_email_${createdUser.email}`, createdUser);
    }

    return createdUser;
  }

  async update(user: User): Promise<User> {
    const updatedUser = await this.repository.update(user);

    // Invalidar caches relacionados
    this.invalidateCache("all_users");
    if (user.id) {
      this.invalidateCache(`user_${user.id}`);
    }
    this.invalidateCache(`user_email_${user.email}`);

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);

    // Invalidar caches relacionados
    this.invalidateCache("all_users");
    this.invalidateCache(`user_${id}`);

    // Não podemos invalidar por email sem buscar o usuário primeiro
  }

  private getFromCache(key: string): User | User[] | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }

    return this.cache.get(key) || null;
  }

  private setCache(key: string, value: User | User[]): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }
}
