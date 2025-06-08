import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

// Extender Request para incluir informações do usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: "Access token is required",
      });
      return;
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    // Adicionar informações do usuário à request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Primeiro executar authMiddleware
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        error: "Admin access required",
      });
      return;
    }
    next();
  });
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req);

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      ) as any;

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Se o token for inválido, simplesmente continue sem usuário
    next();
  }
};

function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Formato: "Bearer <token>"
  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
}
