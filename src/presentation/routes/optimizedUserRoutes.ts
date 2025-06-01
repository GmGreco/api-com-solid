import { Router, Request, Response, NextFunction } from "express";
import { CreateUserUseCase } from "../../domain/useCases/CreateUserUseCase";
import { GetAllUsersUseCase } from "../../domain/useCases/GetAllUsersUseCase";
import { GetUserByIdUseCase } from "../../domain/useCases/GetUserByIdUseCase";
import { prisma } from "../../infrastructure/database/prisma";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";

// Importando apenas os 3 padrões essenciais
import { CachedUserRepository } from "../../infrastructure/decorators/CachedUserRepository";
import {
  AuthorizedUserRepository,
  AuthContext,
} from "../../infrastructure/proxies/AuthorizedUserRepository";
import { NodemailerEmailAdapter } from "../../infrastructure/adapters/NodemailerEmailAdapter";

// Interface para request autenticado
interface AuthenticatedRequest extends Request {
  authContext: AuthContext;
}

const optimizedUserRouter = Router();

// Middleware de autenticação simplificado
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as AuthenticatedRequest).authContext = {
    userId: (req.headers["user-id"] as string) || "user-123",
    role: (req.headers["user-role"] as "admin" | "user") || "user",
    permissions: ["users:read", "users:update", "users:create", "users:delete"],
  };

  console.log(
    `🔐 Auth: ${(req as AuthenticatedRequest).authContext.role} accessing ${
      req.path
    }`
  );
  next();
};

optimizedUserRouter.use(authMiddleware);

// Configuração dos repositórios com os padrões essenciais
const baseRepository = new PrismaUserRepository(prisma);
const cachedRepository = new CachedUserRepository(baseRepository); // 🎨 DECORATOR Pattern

// Configuração do serviço de email
const emailService = new NodemailerEmailAdapter({}); // 🔌 ADAPTER Pattern

// Use Cases
const createUserUseCase = new CreateUserUseCase(cachedRepository);
const getAllUsersUseCase = new GetAllUsersUseCase(cachedRepository);
const getUserByIdUseCase = new GetUserByIdUseCase(cachedRepository);

// 📝 CREATE USER - Com todos os 3 padrões
optimizedUserRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, password, sendWelcomeEmail = true } = req.body;
    const authContext = (req as AuthenticatedRequest).authContext;

    // 🛡️ PROXY Pattern - Controle de acesso
    const authorizedRepository = new AuthorizedUserRepository(
      cachedRepository,
      authContext
    );
    const authorizedCreateUseCase = new CreateUserUseCase(authorizedRepository);

    // Criar usuário com controle de acesso
    const result = await authorizedCreateUseCase.execute({
      name,
      email,
      password,
    });

    // 🔌 ADAPTER Pattern - Envio de email
    if (sendWelcomeEmail) {
      await emailService.sendEmail({
        to: email,
        subject: "Welcome to our platform!",
        body: `Hello ${name}, welcome to our platform!`,
        isHtml: false,
      });
      console.log(`📧 Welcome email sent to ${email}`);
    }

    console.log(
      `✅ User created: ${result.user.email} by ${authContext.userId}`
    );
    return res.status(201).json(result.user.toJSON());
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Create user failed: ${errorMessage}`);

    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// 📋 GET ALL USERS - Com cache e controle de acesso
optimizedUserRouter.get("/", async (req: Request, res: Response) => {
  try {
    const authContext = (req as AuthenticatedRequest).authContext;

    // 🛡️ PROXY Pattern - Controle de acesso + 🎨 DECORATOR Pattern - Cache
    const authorizedRepository = new AuthorizedUserRepository(
      cachedRepository,
      authContext
    );
    const authorizedGetAllUseCase = new GetAllUsersUseCase(
      authorizedRepository
    );

    const result = await authorizedGetAllUseCase.execute();

    console.log(
      `📊 Retrieved ${result.users.length} users for ${authContext.userId} (${authContext.role})`
    );
    return res.status(200).json({
      users: result.users.map((user) => user.toJSON()),
      totalCount: result.users.length,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Get users failed: ${errorMessage}`);

    if (error instanceof Error) {
      if (error.message.includes("Access denied")) {
        console.warn(
          `🚫 Access denied for ${
            (req as AuthenticatedRequest).authContext.userId
          }`
        );
        return res.status(403).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unexpected error" });
  }
});

// 👤 GET USER BY ID - Com cache e controle de acesso
optimizedUserRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authContext = (req as AuthenticatedRequest).authContext;

    // 🛡️ PROXY Pattern - Controle de acesso + 🎨 DECORATOR Pattern - Cache
    const authorizedRepository = new AuthorizedUserRepository(
      cachedRepository,
      authContext
    );
    const authorizedGetByIdUseCase = new GetUserByIdUseCase(
      authorizedRepository
    );

    const result = await authorizedGetByIdUseCase.execute({ id });

    console.log(`👤 User ${id} retrieved by ${authContext.userId}`);
    return res.status(200).json(result.user.toJSON());
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Get user ${req.params.id} failed: ${errorMessage}`);

    if (error instanceof Error) {
      if (error.message.includes("Access denied")) {
        console.warn(
          `🚫 Access denied: ${
            (req as AuthenticatedRequest).authContext.userId
          } tried to access user ${req.params.id}`
        );
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unexpected error" });
  }
});

export { optimizedUserRouter };
