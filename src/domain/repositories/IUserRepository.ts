import { User } from "../entities/User";
export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
}
export interface UserFilters {
  role?: string;
  email?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}
