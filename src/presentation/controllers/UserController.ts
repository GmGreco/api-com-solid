import { Request, Response } from "express";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class UserController {
  constructor(private userRepository: IUserRepository) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const user = await this.userRepository.findById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const { name, email } = req.body;

      if (!name && !email) {
        res.status(400).json({
          success: false,
          error: "At least one field (name or email) is required",
        });
        return;
      }

      const user = await this.userRepository.findById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: "User not found",
        });
        return;
      }

      // Verificar se email já existe (se fornecido)
      if (email && email !== user.email) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
          res.status(400).json({
            success: false,
            error: "Email already exists",
          });
          return;
        }
      }

      // Atualizar campos
      if (name) {
        user.updateName(name);
      }
      if (email) {
        user.updateEmail(email);
      }

      const updatedUser = await this.userRepository.update(user);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
          },
        },
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { limit, offset } = req.query;

      const users = await this.userRepository.findAll(
        limit ? parseInt(limit as string) : 50,
        offset ? parseInt(offset as string) : 0
      );

      res.status(200).json({
        success: true,
        data: {
          users: users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
          total: users.length,
          pagination: {
            limit: limit ? parseInt(limit as string) : 50,
            offset: offset ? parseInt(offset as string) : 0,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
