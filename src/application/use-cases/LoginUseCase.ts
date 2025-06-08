import { IUserRepository } from "../../domain/repositories/IUserRepository";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  error?: string;
}
export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}
  async execute(request: LoginRequest): Promise<LoginResponse> {
    try {
      this.validateRequest(request);
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        return {
          success: false,
          error: "Invalid credentials",
        };
      }
      const isPasswordValid = await bcrypt.compare(
        request.password,
        user.password
      );
      if (!isPasswordValid) {
        return {
          success: false,
          error: "Invalid credentials",
        };
      }
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );
      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }
  private validateRequest(request: LoginRequest): void {
    if (!request.email || !request.email.includes("@")) {
      throw new Error("Invalid email format");
    }
    if (!request.password) {
      throw new Error("Password is required");
    }
  }
}
