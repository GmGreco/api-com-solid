import { Request, Response } from "express";
import {
  RegisterUserUseCase,
  RegisterUserRequest,
} from "../../application/use-cases/RegisterUserUseCase";
import {
  LoginUseCase,
  LoginRequest,
} from "../../application/use-cases/LoginUseCase";
import { UserRole } from "../../domain/entities/User";

export class AuthController {
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUseCase: LoginUseCase
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      // Validação básica
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: name, email, password",
        });
        return;
      }

      // Validar role se fornecido
      if (role && !Object.values(UserRole).includes(role)) {
        res.status(400).json({
          success: false,
          error: "Invalid role",
        });
        return;
      }

      const registerRequest: RegisterUserRequest = {
        name,
        email,
        password,
        role,
      };

      const result = await this.registerUserUseCase.execute(registerRequest);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: {
            user: result.user,
          },
          message: "User registered successfully",
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

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validação básica
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: email, password",
        });
        return;
      }

      const loginRequest: LoginRequest = {
        email,
        password,
      };

      const result = await this.loginUseCase.execute(loginRequest);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: {
            token: result.token,
            user: result.user,
          },
          message: "Login successful",
        });
      } else {
        res.status(401).json({
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
