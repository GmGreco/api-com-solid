import { User, UserRole } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
export interface RegisterUserResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
  error?: string;
}
export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}
  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    try {
      this.validateRequest(request);
      const existingUser = await this.userRepository.findByEmail(request.email);
      if (existingUser) {
        return {
          success: false,
          error: "Email already exists",
        };
      }
      const hashedPassword = await bcrypt.hash(request.password, 10);
      const userId = uuidv4();
      const user = new User(
        userId,
        request.email,
        hashedPassword,
        request.name,
        request.role || UserRole.CUSTOMER
      );
      const savedUser = await this.userRepository.create(user);
      return {
        success: true,
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          createdAt: savedUser.createdAt,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }
  private validateRequest(request: RegisterUserRequest): void {
    if (!request.name || request.name.trim().length < 2) {
      throw new Error("Name must have at least 2 characters");
    }
    if (!request.email || !request.email.includes("@")) {
      throw new Error("Invalid email format");
    }
    if (!request.password || request.password.length < 6) {
      throw new Error("Password must have at least 6 characters");
    }
    if (request.role && !Object.values(UserRole).includes(request.role)) {
      throw new Error("Invalid role");
    }
  }
}
